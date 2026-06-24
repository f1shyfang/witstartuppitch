# 20 Hackathon Ideas: The Coordination Problem

Ideas for the **Startup Pitch Competition** case brief (*The Coordination Problem*), filtered through Chris's *Winning Hackathons for Fun and Profit* framework.

**Source brief:** AI-native solutions to coordination bottlenecks — not faster workflows, but coordination decisions at the speed of data, not institutions.

**Chris's lens:** Creativity > Impact > Tech > Polish. Ask: *"Would it be ridiculous if someone built this and didn't win?"*

---

## Case Brief Summary (What Judges Want)

The competition is **"The Coordination Problem"**: pick a **specific** coordination failure (not "inefficiency"), explain why it persists despite data/capital/tech, **quantify cost**, propose a **narrow wedge**, and make **AI load-bearing** — decisions at the speed of data, not institutions. Strong entries look like **startups** with branding, research, and a prototype journey.

A coordination failure exists when:

- Critical information exists but never reaches the right actor at the right time
- Systems cannot allocate resources or communicate across organisational boundaries
- Incentives are misaligned; rational individually, irrational collectively
- Trust and verification are too slow, too expensive, or absent

**Example domains from brief:**

| Domain | Cost signal |
|--------|-------------|
| Energy grids | ~$20B/year wasted curtailment globally |
| Supply chains | ~$184B annual US disruption cost |
| Capital allocation | ~$290T global assets under management |

**Submission requirements:** Max 8 slides, evidence of prototyping + market research, build a startup (not just a solution), clarity over quantity.

---

## 20 Ideas (High Vector Distance, Brief-Aligned)

### Energy Grids (~$20B/year curtailment)

#### 1. Curtailment Auctioneer

**Tagline:** "Sell your neighbor's spare solar before the grid throws it away."

- **Failure:** Decentralized generation exists, but no minute-level routing layer between homes, batteries, and local loads.
- **Wedge:** One suburb block — when curtailment signal hits, AI agents negotiate micro-transfers between 5 households in <60 seconds.
- **Wow demo:** Live map: "$47 of energy about to be wasted → rerouted to EV charging in 43 seconds."
- **AI load-bearing:** Real-time multi-party negotiation + forecast, not a dashboard.

#### 2. Interconnection Unblocker

**Tagline:** "Find the one PDF holding up 200 solar projects."

- **Failure:** Grid interconnection queues stall for years because dependencies across utilities, studies, and permits aren't coordinated.
- **Wedge:** Ingest one public interconnection queue; AI builds dependency graph and identifies highest-leverage unblock.
- **Cost hook:** Weeks → minutes to find the critical path.
- **Wow:** "Unlocking Study #4 releases 340 MW."

#### 3. Demand Flex Orchestra

**Tagline:** "Your dishwasher negotiates with the grid so you don't have to."

- **Failure:** Demand response programs exist but enrollment + coordination is institutional (emails, seasons, opt-ins).
- **Wedge:** 10 smart appliances; AI coordinates deferral bids when price/spike signals arrive.
- **Wow:** Appliances visibly "vote" on a load-shedding decision in real time.

---

### Supply Chains (~$184B/year US disruption cost)

#### 4. Ghost Load Matcher

**Tagline:** "Empty trucks are a coordination failure, not a capacity failure."

- **Failure:** Return legs run empty because brokers don't share timing/lane signals across org boundaries.
- **Wedge:** Federated matching — AI matches compatible loads without exposing shipper identities.
- **Wow:** "Truck was 94% empty → matched in 4 minutes, saved 180 deadhead miles."

#### 5. Cascade Stopper

**Tagline:** "Catch the 2-hour delay before it becomes a 2-week shortage."

- **Failure:** Node-level signals (inventory, port delay) never feed upstream allocation in time.
- **Wedge:** One SKU, one supplier tier — AI simulates propagation and triggers reroute before stockout.
- **Wow:** Domino animation stopping at tier 2 instead of tier 7.

#### 6. Cold Chain Custody Relay

**Tagline:** "When the temperature spikes, who owns the handoff?"

- **Failure:** Multi-party custody chains can't reassign liability + reroute in minutes during deviation.
- **Wedge:** Simulated 2°C breach → AI renegotiates custody across 4 handlers and drafts new route.
- **Wow:** "Liability transferred + new carrier booked in 90 seconds."

#### 7. Spare Parts Airline Swap

**Tagline:** "Borrow a $2M engine part from your competitor's hangar."

- **Failure:** Global spare pools exist but cross-carrier coordination takes days; AOG costs ~$50k+/hour.
- **Wedge:** AI negotiates borrow/return SLAs between two mock airlines for one part.
- **Wow:** Live "AOG clock" ticking down as agent closes deal.

---

### Capital Allocation (~$290T AUM, fragmented matching)

#### 8. QuackerScroll

**Tagline:** "Startup roles exist. The right person never hears about them."

- **Failure:** Hiring signal is fragmented across LinkedIn, angels, warm intros, and cap-table-adjacent networks — coordination, not information scarcity.
- **Wedge:** Transparent "role intent" layer for pre-seed startups: equity, stage, time commitment, decision speed — matched to candidates by fit, not keyword search.
- **Wow:** "This role was invisible on LinkedIn; matched in 11 minutes via investor graph + founder intent."
- **Why it wins:** Specific persona (early startup hire), memorable name, real pain (ghosted recruiting).

#### 9. 48-Hour Investability

**Tagline:** "Dry powder isn't the problem. Coordination latency is."

- **Failure:** Capital sits undeployed because parallel diligence (legal, tax, ESG, references) isn't orchestrated.
- **Wedge:** Upload one deal room; AI coordinates checklist completion across mock specialists and surfaces "investable / not yet."
- **Wow:** "Deal went from 'maybe' to 'term sheet ready' in one coordinated pass."

#### 10. Grant Stack Composer

**Tagline:** "The money exists in 47 programs. Nobody coordinates the applications."

- **Failure:** Climate/deep-tech founders miss non-dilutive capital because grant eligibility + timing isn't coordinated across jurisdictions.
- **Wedge:** One hardware startup profile → AI sequences 3 grants by deadline, dependency, and overlap.
- **Wow:** Calendar that auto-reorders when one deadline slips.

#### 11. Syndicate Signal Room

**Tagline:** "Angels don't lack deals. They lack synchronized conviction."

- **Failure:** Angel groups fail to coordinate "who's in, how much, by when" before rounds close.
- **Wedge:** AI runs async conviction gathering + allocation in one session with conflict rules.
- **Wow:** Live cap table updating as angels commit.

---

### Infrastructure & Permits (years of stall)

#### 12. Permit Dependency Graph

**Tagline:** "Your project isn't slow. Permit #23 is."

- **Failure:** 30+ agencies with hidden dependencies; no one owns cross-boundary escalation.
- **Wedge:** One stalled infrastructure project → AI maps blockers and auto-drafts escalation to the single holding party.
- **Wow:** "Removing this one signature saves 14 months."

#### 13. Contractor Mesh for Public Works

**Tagline:** "The crew exists. The schedule doesn't."

- **Failure:** Specialized crews + equipment sit idle while projects wait on uncoordinated subcontractor availability.
- **Wedge:** AI reschedules 5 subcontractors as one delay hits.
- **Wow:** Gantt chart self-healing in demo.

---

### Healthcare & Life-Critical Coordination

#### 14. OR Tetris

**Tagline:** "One delayed surgery orphans three ORs."

- **Failure:** Surgical suites, specialists, and recovery beds aren't re-coordinated when delays cascade.
- **Wedge:** One hospital day — delay triggers AI reschedule across 6 cases.
- **Wow:** "Recovered 2.5 OR-hours without canceling patients."

#### 15. Organ Corridor Agent

**Tagline:** "The organ isn't late. The handoffs are."

- **Failure:** Organ transport requires synchronized flight, ambulance, OR team — each on different clocks.
- **Wedge:** AI owns master timeline and pings each actor at their window.
- **Wow:** Countdown with each party turning green as they confirm.

#### 16. Trial Slot Matcher

**Tagline:** "The patient exists. The trial slot doesn't know."

- **Failure:** Eligibility signals across hospitals never reach trial coordinators in real time.
- **Wedge:** Match orphan patients to opening slots across 3 sites.
- **Wow:** "Patient 4,200 miles away qualified in 6 minutes."

---

### Emerging / Orthogonal (High WTF Factor)

#### 17. Mutual Aid Microgrid

**Tagline:** "Your neighbor's generator is 200 meters away. The grid doesn't know."

- **Failure:** During outages, hyperlocal supply/demand isn't coordinated; liability/trust blocks sharing.
- **Wedge:** Block-level outage → AI matches generators + loads + auto-generated liability waivers.
- **Wow:** Post-outage map showing energy traded between houses.

#### 18. Refugee Credential Relay

**Tagline:** "Engineer in Syria. Employer in Berlin. No coordination layer."

- **Failure:** Skills attestation doesn't cross borders; verification is slow and fragmented.
- **Wedge:** AI coordinates multi-source attestation so one profile becomes employer-trusted in 72h.
- **Wow:** "18-month hiring gap → 3-day verified match."

#### 19. Water Minute Market

**Tagline:** "Farmers flood while neighbors drought — on paper, not in reality."

- **Failure:** Water rights reallocation runs on monthly cycles during hourly heat spikes.
- **Wedge:** Simulated heat event → AI enables minute-level reallocation between 3 rights holders.
- **Wow:** Live "gallons redirected" counter during heat spike.

#### 20. Duck & Cat

**Tagline:** "The tutor is free. The student is ready. Nothing connects them."

- **Failure:** Language learning coordination fails across timezone, payment, curriculum progress, and trust — not content scarcity.
- **Wedge:** AI coordinates 15-minute "micro-lesson" slots between tutors + learners with instant payment + progress handoff.
- **Wow:** "Booked, paid, lesson started — 90 seconds from intent to call."
- **Note:** Crowded space — win only with a **weird wedge** (e.g. crisis interpreters, dialect-specific matching, or "lesson liquidity" across time zones).

---

## How to Pick Your Top 3

| Idea | Creativity | Impact clarity | Demo-ability | Brief fit |
|------|------------|----------------|--------------|-----------|
| QuackerScroll | High | Very high (specific persona) | High | Capital/talent matching |
| Curtailment Auctioneer | Very high | High ($20B) | Medium-high | Energy grid |
| Organ Corridor Agent | Very high | Extreme | Medium | General coordination |
| Cascade Stopper | Medium | Very high ($184B) | High | Supply chain |
| Permit Dependency Graph | High | High (time = money) | High | Infrastructure |

**Avoid (low vector distance):** "AI supply chain dashboard," "ChatGPT for energy trading," "AI scheduling assistant," "blockchain for transparency." Judges will shrug.

**Chris test for each idea:** Can you pitch it in one line that makes someone say "wait, what?" — then show **one use case** that **works** in 60 seconds?

---

## Top Picks

**QuackerScroll** and **Curtailment Auctioneer** are the strongest blend of personal notes, the brief, and Chris's "orthogonal + memorable" bar.

---

## Next Steps (Optional)

For top 2–3 ideas, draft:

- 8-slide deck outline (title → problem → wedge → demo → market → AI mechanism → business model → ask)
- Quantified cost lines with sources
- 24-hour hackathon build scope (what to fake vs. what must be real)
