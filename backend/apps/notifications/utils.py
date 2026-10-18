import logging
from django.core.mail import send_mail
from django.conf import settings
from .models import Notification

logger = logging.getLogger(__name__)

def create_notification(recipient, title, message, notification_type='status_change', issue=None, send_email=True):
    """
    Creates an in-app notification and optionally logs/sends an email notification.
    """
    if not recipient:
        return None

    notification = Notification.objects.create(
        recipient=recipient,
        title=title,
        message=message,
        notification_type=notification_type,
        issue=issue
    )

    if send_email and recipient.email:
        subject = f"[CampusFix] {title}"
        body = f"Hello {recipient.get_full_name() or recipient.username},\n\n{message}\n\nView details on CampusFix portal.\n\nThank you,\nCampusFix Facility Team"
        try:
            # We log the email notification clearly for development/production
            logger.info("Sending Email to %s: %s", recipient.email, subject)
            # send_mail(subject, body, settings.DEFAULT_FROM_EMAIL or 'noreply@campusfix.edu', [recipient.email], fail_silently=True)
        except Exception as e:
            logger.error("Failed to send email: %s", str(e))

    return notification
