-- =================================================================
-- Currly: Category Consolidation  ~60 categories → 12 canonical
-- Run in: Supabase Dashboard → SQL Editor
-- Run BEFORE deploying code changes that rely on exact-match queries
-- =================================================================

BEGIN;

-- ── Step 1: Rename the large primary categories ──────────────────
UPDATE tools SET main_category = 'Productivity & Automation'
  WHERE main_category = 'Business & Productivity';

UPDATE tools SET main_category = 'Content & Creative'
  WHERE main_category = 'Content Creation & Media';

UPDATE tools SET main_category = 'AI Agents & Assistants'
  WHERE main_category = 'AI Assistants & Chat';

UPDATE tools SET main_category = 'HR & Recruitment'
  WHERE main_category = 'Recruitment & HR';

UPDATE tools SET main_category = 'Customer Support'
  WHERE main_category = 'Communication & Support';

-- ── Step 2: Absorb fragment categories ───────────────────────────

-- → Development & Engineering
UPDATE tools SET main_category = 'Development & Engineering'
  WHERE main_category IN (
    'Developer Tools', 'AI Engineering', 'Data Engineering',
    'AI Infrastructure', 'Security', 'AI Security', 'No-Code'
  );

-- → Content & Creative
UPDATE tools SET main_category = 'Content & Creative'
  WHERE main_category IN (
    'Content Creation', 'Content', 'Creative',
    'Video Creation', 'Video Editing', 'Video Collaboration', 'AI Video',
    'Design', 'Entertainment & Media'
  );

-- → Marketing & Sales
UPDATE tools SET main_category = 'Marketing & Sales'
  WHERE main_category IN ('Marketing', 'Sales', 'CRM');

-- → Productivity & Automation
UPDATE tools SET main_category = 'Productivity & Automation'
  WHERE main_category IN (
    'Productivity', 'Workflow Automation', 'Product Management',
    'Document Processing', 'AI Automation', 'Enterprise AI', 'Small Business'
  );

-- → AI Agents & Assistants
UPDATE tools SET main_category = 'AI Agents & Assistants'
  WHERE main_category IN ('AI Companion', 'Emerging & Experimental');

-- → Data & Analytics
UPDATE tools SET main_category = 'Data & Analytics'
  WHERE main_category IN ('AI Research', 'Research', 'Data Analytics', 'AI/ML Dataset');

-- → HR & Recruitment
UPDATE tools SET main_category = 'HR & Recruitment'
  WHERE main_category = 'Talent';

-- → Finance & Legal
UPDATE tools SET main_category = 'Finance & Legal'
  WHERE main_category IN (
    'Fintech', 'Legal Tech', 'Insurance Tech', 'Investment', 'Private Equity'
  );

-- → Education & Learning
UPDATE tools SET main_category = 'Education & Learning'
  WHERE main_category IN ('Learning & Knowledge', 'EdTech', 'Education');

-- → Health & Wellness
UPDATE tools SET main_category = 'Health & Wellness'
  WHERE main_category = 'Health Tech';

-- → Specialized Industry
UPDATE tools SET main_category = 'Specialized Industry'
  WHERE main_category IN (
    'E-Commerce', 'E-commerce', 'Hardware & Devices', 'Wearables',
    'Robotics', 'Dating', 'Social'
  );

COMMIT;

-- ── Verification ─────────────────────────────────────────────────
-- Run this separately after COMMIT to confirm the final distribution.
-- Expected: exactly 12 rows, all with canonical names.

SELECT
  main_category,
  COUNT(*) AS tool_count
FROM tools
WHERE launch_status = 'Live'
GROUP BY main_category
ORDER BY tool_count DESC;
