import {
    AbstractNotificationService,
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

    protected orderService_: OrderService;
    protected logger_: Logger;
    protected emailConfig: EmailConfig;

    constructor(container: any, _options: EmailConfig) {
        super(container);

        this.logger_ = container.logger;
        this.logger_.info("✔ Email service initialized");

        this.orderService_ = container.orderService;
        this.emailConfig = _options;
        if (!this.emailConfig.templateDir) {
            this.emailConfig.templateDir = "node_modules/@rootxpdev/medusa-email-plugin/data/emails";
        }
        this.logger_.info(`Email templates loaded from ${this.emailConfig.templateDir}`);
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
        this.logger_.info(`Sending notification '${event}' via email service`);
        if (event === "order.placed") {
            // retrieve order
            // @ts-ignore
            const order = await this.orderService_.retrieve(data.id? || '');

            await this.sendEmail(order.email, 'Order received', event, {
                orderItems: order.items,
            })

            return {
                to: 'test@test.com',
                data: {},
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
        const transport = nodemailer.createTransport({
            host: this.emailConfig.smtpHost,
            port: this.emailConfig.smtpPort,
            auth: {
                user: this.emailConfig.smtpUser,
                pass: this.emailConfig.smtpPassword,
            }
        });
        this.logger_.info(`Sending email to '${toAddress}' using template '${templateName}'`);
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
            locals: data,
        });
    }
}

export default EmailsService;