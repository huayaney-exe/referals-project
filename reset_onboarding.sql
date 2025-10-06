-- Temporary: Reset onboarding status for all businesses (dev only)
UPDATE businesses
SET onboarding_completed = false,
    onboarding_completed_at = NULL;

-- Show updated count
SELECT COUNT(*) as businesses_reset FROM businesses WHERE onboarding_completed = false;
