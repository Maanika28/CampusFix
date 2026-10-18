from django.db import models
from django.conf import settings
from django.utils import timezone

CATEGORY_WEIGHTS = {
    'Safety': 40,
    'Electrical': 35,
    'Wi-Fi': 30,
    'Plumbing': 25,
    'Laboratory': 25,
    'Cleanliness': 20,
    'Furniture': 15,
    'Others': 10,
}

class Issue(models.Model):
    CATEGORY_CHOICES = (
        ('Electrical', 'Electrical'),
        ('Plumbing', 'Plumbing'),
        ('Wi-Fi', 'Wi-Fi'),
        ('Furniture', 'Furniture'),
        ('Cleanliness', 'Cleanliness'),
        ('Laboratory', 'Laboratory'),
        ('Safety', 'Safety'),
        ('Others', 'Others'),
    )

    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Assigned', 'Assigned'),
        ('In Progress', 'In Progress'),
        ('Resolved', 'Resolved'),
        ('Closed', 'Closed'),
    )

    PRIORITY_CHOICES = (
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
        ('Urgent', 'Urgent'),
    )

    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Pending')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='Medium')
    priority_score = models.IntegerField(default=20)

    # Relationships
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reported_issues'
    )
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_issues'
    )
    department = models.ForeignKey(
        'departments.Department',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='issues'
    )
    building = models.ForeignKey(
        'departments.Building',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='issues'
    )
    classroom = models.ForeignKey(
        'departments.Classroom',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='issues'
    )
    location_detail = models.CharField(max_length=200, blank=True, help_text="e.g. 2nd row near projector")

    # Images (Before & After)
    image = models.ImageField(upload_to='issues/before/', blank=True, null=True)
    repair_image = models.ImageField(upload_to='issues/after/', blank=True, null=True)
    repair_notes = models.TextField(blank=True)

    # Timestamps
    estimated_completion = models.DateTimeField(null=True, blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-priority_score', '-created_at']

    def __str__(self):
        return f"[{self.category}] {self.title} ({self.status})"

    def calculate_priority_score(self):
        """
        Smart priority score calculation:
        Base = Category weight
        + (Upvotes * 10)
        + (Days pending * 4)
        """
        base = CATEGORY_WEIGHTS.get(self.category, 15)
        upvotes_count = self.upvotes.count() if self.pk else 0
        
        days_open = 0
        if self.created_at:
            delta = timezone.now() - self.created_at
            days_open = max(0, delta.days)

        score = base + (upvotes_count * 10) + (days_open * 4)

        if score >= 65:
            calculated_priority = 'Urgent'
        elif score >= 40:
            calculated_priority = 'High'
        elif score >= 25:
            calculated_priority = 'Medium'
        else:
            calculated_priority = 'Low'

        self.priority_score = score
        self.priority = calculated_priority
        return score


class StatusHistory(models.Model):
    issue = models.ForeignKey(Issue, on_delete=models.CASCADE, related_name='status_history')
    status = models.CharField(max_length=30)
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.issue.title} -> {self.status} on {self.created_at:%Y-%m-%d}"


class Comment(models.Model):
    issue = models.ForeignKey(Issue, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Comment by {self.author.email} on #{self.issue.id}"


class Upvote(models.Model):
    issue = models.ForeignKey(Issue, on_delete=models.CASCADE, related_name='upvotes')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='upvotes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('issue', 'user')

    def __str__(self):
        return f"{self.user.email} upvoted #{self.issue.id}"
