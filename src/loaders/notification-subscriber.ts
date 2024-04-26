export default async (container: any): Promise<void> => {
    const notificationService = container.resolve("notificationService")

    // TODO: register all notification events
    const emailEvents: string[] = [
        'order.placed',
        'order.cancelled',
        'order.completed',
        'order.shipment_created',
        'order.refund_created',
    ];
    for (const event of emailEvents) {
        notificationService.subscribe(
            event,
            "emails"
        )
    }
}
