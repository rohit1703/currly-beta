# Currly — What We Built This Week

**Date:** 3 May 2026  
**Written for:** Non-technical cofounder  
**TL;DR:** We turned Currly from a tool directory into a decision engine that learns from every user choice.

---

## The Big Picture

When we started this week, Currly was already a solid product — users could search for AI tools, compare them side by side, and save favourites. Good, but generic. A dozen sites do that.

What we built this week answers a harder question: **what do users actually choose, and does it work out for them?** That data, compounding over time, is what turns Currly into something no one can copy by cloning our database.

---

## What We Built

### 1. Onboarding — "Tell us what you do"

**What it is**  
When a new user signs up, we ask them three quick questions before they start searching:
- What's your role? (Founder, Sales, Developer, Marketer…)
- What's your monthly AI tool budget?
- What are you mainly trying to do? (Outbound Sales, Customer Support, Building Products…)

It takes about 30 seconds. They can skip it.

**Why it matters**  
Two users searching for "AI assistant" want completely different things. A salesperson wants Apollo or Clay. A developer wants GitHub Copilot. Without knowing who the user is, every result is a guess.

**What changes for users**  
A Sales rep who says "I do Outbound Sales, budget under $100/month" sees tools relevant to their workflow at the top — not a generic list.

---

### 2. Collections — "Save tools you're evaluating"

**What it is**  
Users can create named lists to organise tools they're considering — like folders. They can share any list with a public link.

**Example**  
A founder creates "Q3 Stack Candidates" and adds 6 tools they're evaluating. They share the link with their CTO or an investor: `currly.com/s/abc123` — the other person sees a clean read-only page, no sign-in needed.

**Why it matters**  
Tool decisions happen over days or weeks, not in a single session. Collections give users a reason to come back, and shared links bring new users to the platform organically.

---

### 3. Decision Capture — "Which one did you actually choose?"

**What it is**  
After a user compares two tools side by side (say, Apollo vs Clay), a small prompt appears at the bottom of the page:

> "Which one are you going with?"  
> [Apollo] · [Clay] · [Still deciding]

If they pick one, we ask one follow-up: "How confident are you?" (Definitely / Probably / Still evaluating). That's it — two taps, then done.

**Why it matters**  
This is the most important thing we built. Right now every tool comparison site tells you *features*. None of them tell you which tool people actually chose. That data doesn't exist anywhere.

After 6 months of this running, we'll be able to say:
- "73% of Sales teams who compared Apollo vs Clay chose Clay"
- "Founders on a <$100 budget almost always pick the free tier of HubSpot over Salesforce"

That's not just useful for users — it's a proprietary signal that makes our search results better, and it's the kind of insight B2B tool vendors would pay for.

**Admin view**  
We can see daily: how many comparisons happened, what % of users made a decision (vs walked away), and the average confidence. If that "decision rate" drops below 15%, something is wrong with the prompt.

---

### 4. Curated Stack Pages — "The tools for your job"

**What it is**  
Six landing pages, one per use case. Each page shows two pre-built tool combinations at different budgets.

Example — **currly.com/stacks/outbound-sales**:

| Stack | Budget | Tools |
|-------|--------|-------|
| Lean Outbound | Under $100/mo | Apollo (free tier) + Instantly + HubSpot |
| Full-Stack Outbound | $500–$2K/mo | Apollo Pro + Clay + Lemlist + Gong |

Each tool card links to its detail page, and there's a "Compare Apollo vs Clay →" button that feeds directly into the decision capture prompt above.

**Why it matters — SEO**  
"Best tools for outbound sales" gets searched thousands of times a month. We now have a page that answers it, with real tool combinations and a clear call to action. That's free traffic.

**Why it matters — conversion**  
Instead of asking a new user to search from scratch, we hand them a ready-made answer. They can swap tools they don't like, but most people will take the path of least resistance. Stack pages are funnels.

---

### 5. Outcome Check-ins — "How did it go?"

**What it is**  
7 days after a user picks a tool, and again 30 days later, a small banner appears on their dashboard:

> "You picked Apollo one week ago — how's it going?"  
> 😞 · 😕 · 😐 · 😊 · 🤩

One tap. Optional follow-up: "How long until you got value?" (dropdown). That's all.

**Why it matters**  
Decision data tells us what people choose. Outcome data tells us if it was the right choice.

**The long-term value**  
After enough responses, we'll know things like:
- Clay has a 4.6/5 satisfaction after 30 days (high)
- Tool X has a 2.1/5 satisfaction after 30 days — most users regret it

We use this to slightly boost well-rated tools in search results. Not artificially — just reflecting real-world outcomes. No other tool directory does this. It's a flywheel: more users → more outcome data → better rankings → more trust → more users.

---

### 6. Smart Rankings (coming online in ~6 weeks)

**What it is**  
An internal system that will, once we have enough data, automatically give a small boost in search results to tools that users report working well.

**The switch**  
It's built but turned off. We'll flip it on in mid-June when the first 30-day outcome check-ins start coming in. Until then, rankings work exactly as before.

**Why we built it now**  
Infrastructure takes time. We wanted the data pipeline ready before we need it, not after.

---

## What We Did NOT Build (and why)

- **Email check-ins:** We'll ask inside the app first. Only worth adding email if >20% of users respond in-app. No point building it until we know people actually want to answer.
- **Paid placements / sponsored slots:** Not until organic rankings are trusted. Polluting results early would kill the thing that makes Currly worth coming back to.

---

## Numbers to Watch

We've set hard targets for ourselves. If any of these slip for more than 2 days, something needs fixing:

| What | Target |
|------|--------|
| Search results load speed | Under 400ms |
| "I can't find what I'm looking for" rate | Under 8% of searches |
| Users who click something after searching | Over 20% |
| Compare-page users who record a decision | Over 15% |
| Users who rate a tool at 4 or 5 stars (outcomes) | Should trend upward |

---

## What's Next

In order of priority:

1. **Check the stack pages** — The tool names on the curated stack pages need to be verified against our live database. If a tool name doesn't match exactly, the card shows empty. Quick fix once we check.

2. **Drop the old saved-tools table** — We rebuilt the save feature three weeks ago, but the old database table is still sitting there. We're deleting it tomorrow once we confirm everything is stable.

3. **Install a test runner** — We have a suite of 25 test cases for our search engine, but no automated way to run them yet. Adding that is the next technical health item.

4. **Outcome data accumulates** — No action needed. The first D7 check-ins will appear for users who make decisions starting next week. By mid-June we'll have enough to meaningfully improve rankings.

---

## The One-Line Pitch Update

Before this week:
> "Currly helps you find and compare AI tools."

After this week:
> "Currly tells you which AI tools people actually chose, and whether those choices worked out."

That's a different product. And the data we're now collecting is the moat.
