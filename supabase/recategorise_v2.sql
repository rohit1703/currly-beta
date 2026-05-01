-- =================================================================
-- Currly: Category Consolidation v2
-- Catches all new-style categories added after v1 migration.
-- Run in: Supabase Dashboard → SQL Editor
-- =================================================================

BEGIN;

-- ── Development & Engineering ─────────────────────────────────────
UPDATE tools SET main_category = 'Development & Engineering'
  WHERE main_category IN (
    'Dev Tools',
    'AI Coding',
    'AI Coding Agents',
    'Engineering',
    'Dev Ops',
    'AI Observability',
    'AI Software Implementation',
    'AI-Assisted Software Development AI-SWE',
    'Infrastructure',
    'Cybersecurity',
    'AI Developer Tools',
    'AI for Chip Design',
    'Browser',
    'AI Prototyping',
    'AI App Builder',
    'AI Mobile App Builder',
    'AI Evaluation',
    'Communications API',
    'AI Agent Infrastructure'
  );

-- ── Content & Creative ────────────────────────────────────────────
UPDATE tools SET main_category = 'Content & Creative'
  WHERE main_category IN (
    'Design & Visuals',
    'AI Design',
    'AI Video Generation',
    'AI Creator Tools',
    'AI Avatars',
    'Video Production Tools',
    'AI Storytelling',
    'AI Generative Models'
  );

-- ── Productivity & Automation ─────────────────────────────────────
UPDATE tools SET main_category = 'Productivity & Automation'
  WHERE main_category IN (
    'AI Productivity',
    'Collaboration',
    'AI Collaboration',
    'Product Ops',
    'AI Process Automation',
    'Workflow',
    'Project Management',
    'Business Ops',
    'AI Product Adoption',
    'AI Forms',
    'AI IT Operations',
    'Autonomous Enterprise AI',
    'AI Business Builder'
  );

-- ── AI Agents & Assistants ────────────────────────────────────────
UPDATE tools SET main_category = 'AI Agents & Assistants'
  WHERE main_category IN (
    'AI Agents',
    'AI Agent',
    'Voice AI',
    'AI Voice Agents',
    'Personal AI',
    'AI Personal Memory',
    'Autonomous Computing',
    'AI Desktop Agent',
    'Consumer AI',
    'Artificial Intelligence',
    'AI',
    'AI Model',
    'AI Tools',
    'Emotional Intelligence AI'
  );

-- ── Marketing & Sales ─────────────────────────────────────────────
UPDATE tools SET main_category = 'Marketing & Sales'
  WHERE main_category IN (
    'Social Media',
    'AI Sales',
    'AI Marketing',
    'AI Marketing Analytics',
    'AI Lead Generation',
    'Sales Intelligence',
    'AI Sales Automation',
    'SalesTech',
    'Growth',
    'AI Brand Protection',
    'AI Growth Infrastructure',
    'AI Community Management'
  );

-- ── Data & Analytics ──────────────────────────────────────────────
UPDATE tools SET main_category = 'Data & Analytics'
  WHERE main_category IN (
    'Data',
    'Analytics',
    'Data-as-a-Service DaaS',
    'AI Data',
    'Data Extraction',
    'Data Ops',
    'Product Analytics'
  );

-- ── HR & Recruitment ──────────────────────────────────────────────
UPDATE tools SET main_category = 'HR & Recruitment'
  WHERE main_category IN (
    'HR',
    'Recruiting'
  );

-- ── Finance & Legal ───────────────────────────────────────────────
UPDATE tools SET main_category = 'Finance & Legal'
  WHERE main_category IN (
    'FinTech',
    'InsurTech',
    'Accounting',
    'Finance'
  );

-- ── Customer Support ──────────────────────────────────────────────
UPDATE tools SET main_category = 'Customer Support'
  WHERE main_category IN (
    'Customer Success',
    'Customer Experience'
  );

-- ── Education & Learning ──────────────────────────────────────────
UPDATE tools SET main_category = 'Education & Learning'
  WHERE main_category IN (
    'AI Learning',
    'Education Technology EdTech'
  );

-- ── Health & Wellness ─────────────────────────────────────────────
UPDATE tools SET main_category = 'Health & Wellness'
  WHERE main_category IN (
    'HealthTech',
    'Healthcare',
    'AI Health',
    'Senior Care'
  );

-- ── Specialized Industry ──────────────────────────────────────────
UPDATE tools SET main_category = 'Specialized Industry'
  WHERE main_category IN (
    'Travel',
    'Manufacturing',
    'Gaming',
    'AI Camera',
    'AI Hardware',
    'Brain-Computer Interface BCI',
    'Marketplace',
    'Architecture',
    'Automotive',
    'AgTech',
    'Logistics',
    'Construction Tech',
    'AI Consulting',
    'Science',
    'AI Lab Automation',
    'AI for Scientific Discovery'
  );

COMMIT;

-- ── Verification ──────────────────────────────────────────────────
-- Expected: exactly 12 rows, all canonical names.
SELECT
  main_category,
  COUNT(*) AS tool_count
FROM tools
WHERE launch_status = 'Live'
GROUP BY main_category
ORDER BY tool_count DESC;
