import {
    NotificationService,
    Logger,
    OrderService,
} from "medusa-interfaces";
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

class EmailsService extends NotificationService {
    static identifier = 'emails';
    static is_installed = true;

    protected orderService: OrderService;
    protected cartService: any;
    protected lineItemService: any;
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
                    "customer",
                    "billing_address",
                    "shipping_address",
                    "discounts",
                    "discounts.rule",
                    "shipping_methods",
                    "shipping_methods.shipping_option",
                    "payments",
                    "fulfillments",
                    "returns",
                    "gift_cards",
                    "gift_card_transactions",
                ]
            });
            this.logger.info(`Order: ${JSON.stringify(order)}`);

            let totalValue = (order.items.reduce((value, item) => {
                return value + item.unit_price * item.quantity;
            }, 0))
            for (const option of order.shipping_methods) {
                totalValue += option.shipping_option.amount;
            }
            await this.sendEmail(order.email, event, {
                event,
                order,
                cart: await this.cartService.retrieve(order.cart_id || ''),
                id: data.id,
                total_value: (totalValue / 100).toFixed(2),
            })

            return {
                to: order.email,
                data: data,
                status: "sent",
            };
        }

        return {
            to: null,
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
        await this.sendEmail('arnis@test.com', 'sample', {
            event: notification,
        })

        return {
            to: 'arnis@arnis.lv',
            data: {},
            status: "sent",
        };
    }

    async sendEmail(toAddress: string, templateName: string, data: any) {
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