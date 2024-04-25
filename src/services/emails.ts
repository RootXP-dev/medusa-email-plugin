import {
    AbstractNotificationService,
    Logger,
    OrderService,
} from "@medusajs/medusa";
import nodemailer from "nodemailer";
import EmailTemplates from "email-templates";

class EmailsService extends AbstractNotificationService {
    static identifier = 'emails';
    static is_installed = true;

    protected orderService_: OrderService;
    protected logger_: Logger;
    protected templateDir_: string;

    constructor(container: any, _options: any) {
        super(container);

        this.logger_ = container.logger;
        this.logger_.info("✔ Email service initialized");

        this.orderService_ = container.orderService;
        this.templateDir_ = _options.templateDir || "node_modules/@rootxpdev/medusa-email-plugin/data/emails"
        this.logger_.info(`Email templates loaded from ${this.templateDir_}`);
    }

    async sendNotification(
        event: string,
        data: unknown,
        attachmentGenerator: unknown
    ): Promise<{
        to: string;
        status: string;
        data: Record<string, unknown>;
    }> {
        this.logger_.info(`Sending notification '${event}' via email service`);
        // if (event === "order.placed") {
        //     // retrieve order
        //     const order = await this.orderService_.retrieve(data.id? || "");
        //     // TODO send email
        //
        //     this.logger_.info("Notification sent");
        //
        //     return {
        //         to: order.email,
        //         status: "done",
        //         data: {
        //             // any data necessary to send the email
        //             // for example:
        //             subject: "You placed a new order!",
        //             items: order.items,
        //         },
        //     };
        // }

        await this.sendEmail('arnis@test.com', 'Testing', 'sample', {
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
            host: "sandbox.smtp.mailtrap.io",
            port: 2525,
            auth: {
                user: "2ff4e7fa6ad11d",
                pass: "eb0281052bde8f"
            }
        });
        this.logger_.info(`Sending email to '${toAddress}' using template '${templateName}'`);
        const email = new EmailTemplates({
            message: {
                from: 'noreply@theboringapps.com'
            },
            // uncomment below to send emails in development/test env:
            transport: transport,
            views: {
                root: this.templateDir_,
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