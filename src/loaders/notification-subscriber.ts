import {
    MedusaContainer,
    NotificationService, OrderService,
} from "@medusajs/medusa"

export default async (
    container: MedusaContainer
): Promise<void> => {
    const notificationService = container.resolve<
        NotificationService
    >("notificationService")

    // TODO: register all notification events
    const emailEvents: string[] = [
        OrderService.Events.PLACED,
        OrderService.Events.CANCELED,
        OrderService.Events.COMPLETED,
        OrderService.Events.PAYMENT_CAPTURED,
        OrderService.Events.FULFILLMENT_CREATED,
        OrderService.Events.SHIPMENT_CREATED,
        OrderService.Events.REFUND_CREATED,
    ];
    for (const event of emailEvents) {
        notificationService.subscribe(
            event,
            "emails"
        )
    }
}
