import {
    AbstractNotificationService, CartService, LineItemService,
    Logger,
    OrderService,
} from "@medusajs/medusa";
import nodemailer from "nodemailer";
import EmailTemplates from "email-templates";

interface EmailConfig {
    templateDir: string;
    fromAddress: string;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
}

class EmailsService extends AbstractNotificationService {
    static identifier = 'emails';
    static is_installed = true;

    protected orderService: OrderService;
    protected cartService: CartService;
    protected lineItemService: LineItemService;
    protected logger: Logger;
    protected emailConfig: EmailConfig;

    constructor(container: any, _options: EmailConfig) {
        super(container);

        this.logger = container.logger;
        this.logger.info("✔ Email service initialized");

        this.orderService = container.orderService;
        this.cartService = container.cartService;
        this.lineItemService = container.lineItemService;
        this.emailConfig = _options;
        if (!this.emailConfig.templateDir) {
            this.emailConfig.templateDir = "node_modules/@rootxpdev/medusa-email-plugin/data/emails";
        }
        this.logger.info(`Email templates loaded from ${this.emailConfig.templateDir}`);
    }

    async sendNotification(
        event: string,
        data: any,
        attachmentGenerator: unknown
    ): Promise<{
        to: string;
        status: string;
        data: Record<string, any>;
    }> {
        this.logger.info(`Sending notification '${event}' via email service`);
        if (event.includes("order.")) {
            // retrieve order
            // @ts-ignore
            const order = await this.orderService.retrieve(data.id || '', {
                relations: [
                    "refunds",
                    "items",
                ]
            });
            this.logger.info(`Order: ${JSON.stringify(order)}`);

            await this.sendEmail(order.email, 'Order received', event, {
                event,
                order,
                cart: await this.cartService.retrieve(order.cart_id || ''),
                id: data.id,
                total_value: (order.items.reduce((value, item) => {
                    return value + item.unit_price;
                }, 0) / 100).toFixed(2),
            })

            return {
                to: order.email,
                data: data,
                status: "sent",
            };
        }

        await this.sendEmail('test@test.com', 'Testing', event, {
            event,
            data,
        })

        return {
            to: 'arnis@arnis.lv',
            data: {},
            status: "sent",
        };
    }

    async resendNotification(
        notification: unknown,
        config: unknown,
        attachmentGenerator: unknown
    ): Promise<{
        to: string;
        status: string;
        data: Record<string, unknown>;
    }> {
        await this.sendEmail('arnis@test.com', 'Testing', 'sample', {
            event: notification,
        })

        return {
            to: 'arnis@arnis.lv',
            data: {},
            status: "sent",
        };
    }

    async sendEmail(toAddress: string, subject: string, templateName: string, data: any) {
        // console.log('data', data)
        this.logger.info(JSON.stringify(data));
        const transport = nodemailer.createTransport({
            host: this.emailConfig.smtpHost,
            port: this.emailConfig.smtpPort,
            auth: {
                user: this.emailConfig.smtpUser,
                pass: this.emailConfig.smtpPassword,
            }
        });
        this.logger.info(`Sending email to '${toAddress}' using template '${templateName}'`);
        const email = new EmailTemplates({
            message: {
                from: this.emailConfig.fromAddress,
            },
            transport: transport,
            views: {
                root: this.emailConfig.templateDir,
                options: {
                    extensions: 'pug',
                },
            },
            send: true,
        });
        await email.send({
            template: templateName,
            message: {
                to: toAddress,
            },
            locals: {
                ...data,
            },
        });
    }
}

export default EmailsService;