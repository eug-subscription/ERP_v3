# ERP Pricing & Workflow Architecture Specification

**Version:** 1.7  
**Status:** Final (ready for dev discovery + implementation plan)  
**Last updated:** 2026-02-09

---

## 1. Purpose

Define a pricing architecture for the ERP that supports:

- Photo, video, AI-only, and hybrid delivery models
- Multi-currency pricing with proper tax/VAT handling
- Consistent pricing governance via global settings
- Project-level flexibility (inherit + controlled overrides)
- Accurate calculation of:
  - Client price (what we charge)
  - Internal cost (what we pay + AI processing)
  - Margin (per component, per order, per project/client tier)
- Core analytics and reporting requirements

---

## 2. Product context

We deliver photo and video production for:

- Enterprise clients
- B2B clients
- Private clients

We also deliver AI-only and hybrid orders where production may include:

- Fully AI generation
- Human retouchers and/or video editors
- Photographers and videographers
- Mixed AI + human production

The ERP is organised around:

- **Projects**: configuration, templates, governance
- **Orders**: execution, actuals, billing outputs

We also require **Global Rate Management** so pricing is consistent, auditable, and reusable across projects.

---

## 3. High-level structure

- **Rate Management (Global)** - multi-currency support
- **Project: Pricing tab** (inherit + controlled overrides + currency/tax settings)
- **Project: Workflow tab** (operational flow only; no pricing fields)
- **Orders** (calculated lines + modifiers + audit trail)

---

## 4. Non-negotiable requirement: cost + client price in one model

The system must support both:

- **Cost rates** (what we pay / internal cost) — also referred to as **Expense** in the UI
  - Photographers
  - Videographers
  - Photo retouchers
  - Video editors
  - AI processing
- **Client rates** (what we charge) — also referred to as **Revenue** in the UI

It must produce:

- Client total (invoice value)
- Internal cost total (payouts + AI cost)
- Margin visibility at a granular level

---

## 5. Known pricing patterns (today)

- AI photo: currently per photo; later packages + bulk discounts
- Photographers/videographers: multiple units
  - per image
  - per package of images (e.g. 10 / 15 / 50)
  - per hour
  - flat rate per day
  - packages of hours
- Photo retouchers: currently per image; likely adopt the same unit options as photographers for consistency
- Video editors: same concept as retouchers, applied to video
- AI video: new; likely per video or per minute, plus potential tiers (e.g. Basic / Advanced / Premium). Tiering may also apply to human editing services.

---

# 6. Pricing model: Hybrid approach

## 6.1 Summary

- **Global Rate Management** defines reusable pricing components in multiple currencies (rate items + rate cards + billing line types + modifier codes).
- **Project Pricing tab** selects currency, tax treatment, a global rate card, and applies controlled project custom rates when needed.
- **Workflow blocks** define operational process steps (e.g., Pro Assigned → Photo Shoot → Retouching → Delivery). Blocks do NOT store pricing modifiers.
- **Orders** are the execution layer: quantities are entered, modifiers are selected (from global modifier codes), and priced line instances are generated with full audit trail.

This keeps workflows focused on operational flow while pricing decisions remain at the order level where actual execution context is known.

---

## 6.2 Calculation rules (core)

### Per workflow block (conceptual)

- **Base rate x quantity (after rules) x modifier**
- Cost and client rates have **independent modifiers** (see Section 9.4)

### Per order (conceptual)

- **Sum of all priced lines + order-level adjustments** (if enabled)
- **Tax calculated based on project settings** (inclusive or exclusive)

Important: the **order's stored line instances** are the source of truth (not "re-calculating from scratch" every time), to support audit and reporting consistency over time.

---

# 7. Global Rate Management (data model)

## 7.1 Rate Items

Atomic pricing units that define **name**, **unit type**, and optionally **associated workflow block types**.

- Values do not live here.
- Rules do not live here.
- Block type associations define which workflow block types this Rate Item can be billed against.

The relationship is **many-to-many**:

- One Rate Item can apply to **multiple** block types (e.g., "Specialist Fee" → `PHOTO_SHOOT` + `VIDEO_SHOOT`)
- One block type can have **multiple** Rate Items (e.g., `PHOTO_SHOOT` → "Photographer Hour" + "Photography Day Rate")

Rate Items without `blockTypes` are used for **manual/order-level billing lines** only (e.g., "Travel Fee", "Licensing Fee").

Example:

- Name: `Photographer Hour`
- Unit: `hour`
- Block Types: `[PHOTO_SHOOT]`

Example:

- Name: `Travel Fee`
- Unit: `package`
- Block Types: *(none — manual line only)*

## 7.2 Rate Cards

A Rate Card is a complete pricing package (values + rules) for a segment in a **single currency**, such as:

- Standard - EUR
- Standard - GBP
- Premium - EUR
- AI-only - USD
- Client-specific (e.g. Enterprise Client X - EUR)

**Multi-currency rule:**

- Each Rate Card is created in a single, specific currency (EUR, GBP, USD, etc.)
- A Rate Card cannot contain entries in multiple currencies
- Projects select currency first, then choose from Rate Cards in that currency
- No automatic currency conversion between Rate Cards
- If the same pricing structure is needed in multiple currencies (e.g., Standard pricing in both EUR and GBP), create separate Rate Cards per currency

**Naming convention (recommended):**
`[Segment] - [Currency] - [Market]` (e.g., "Standard - EUR - PT", "Premium - GBP - UK")

For each Rate Item, a Rate Card stores:

- **Cost rate**
- **Client rate**
- Optional rules/constraints (minimums only for MVP; packages, tiers deferred)

Example (Rate Card: `Standard - EUR`):

- Currency: EUR
- Rate Item: Photographer Hour
  - Cost rate: EUR 50
  - Client rate: EUR 100
  - Minimum: 2 hours

Example (Rate Card: `Standard - GBP`):

- Currency: GBP
- Rate Item: Photographer Hour
  - Cost rate: GBP 45
  - Client rate: GBP 85
  - Minimum: 2 hours

## 7.3 Billing Line Types (Simplified)

> **Implementation Note:** The original design included a separate `BillingLineType` entity that mapped to Rate Items. In the current implementation, this was **simplified away** - workflow blocks and billing lines reference `RateItem` directly.
>
> The `RateItem.displayName` field serves the purpose of user-facing labels that `BillingLineType.name` would have provided. This simplification reduces data model complexity while maintaining the core constraint: all billable lines must reference a defined Rate Item from the global catalogue.

This keeps reporting consistent and prevents "custom one-off" lines that break analytics.

## 7.4 Entity Relationship Diagram (Simplified)

> **Note:** This ERD reflects the **implemented model** where `BillingLineType` was simplified away. Workflow blocks and billing lines reference `RateItem` directly.

```text
+-----------------+
|   RateItem      |
+-----------------+
| id (PK)         |
| name            |
| displayName     | (user-facing label)
| unit_type       |
| blockTypes[]    | (optional array of WorkflowBlockType)
| status          |
+-----------------+
        |
        | 1
        |
        v *
+-----------------+          +-------------------+
| RateCardEntry   |          |  WorkflowBlock    |
+-----------------+          +-------------------+
| id (PK)         |          | id (PK)           |
| rate_card_id(FK)|<---+     | project_id (FK)   |
| rate_item_id(FK)|   |     | name              |
| cost_rate       |   |     | sequence          |
| client_rate     |   |     | status            |
| rules_json      |   |     +-------------------+
+-----------------+   |
                      |
                      | *
+-----------------+   |
|   RateCard      |---+
+-----------------+
| id (PK)         |
| name            |
| currency        | (single currency)
| status          |
| version         |
+-----------------+
        |
        | 1
        |
        v *
+-----------------+
|    Project      |
+-----------------+
| id (PK)         |
| rate_card_id(FK)|
| currency        | (immutable after first order)
| tax_treatment   |
| tax_rate        |
+-----------------+
        |
        | 1
        |
        v *
+-----------------+
|     Order       |
+-----------------+
| id (PK)         |
| project_id (FK) |
| rate_card_id(FK)| (snapshot at order creation)
| status          |
+-----------------+
        |
        | 1
        |
        v *
+-------------------------+
|  BillingLineInstance    |
+-------------------------+
| id (PK)                 |
| order_id (FK)           |
| rate_item_id (FK)       |
| rate_card_id (FK)       |
| source_block_id (FK)    | (optional, for traceability)
| ... (all audit fields)  |
| status                  |
+-------------------------+
```

**Key relationships:**

- RateCard 1 -- * RateCardEntry
- RateItem 1 -- * RateCardEntry
- Project 1 -- * WorkflowBlock
- WorkflowBlock * -- 0..1 RateItem (optional - only billable blocks have rate items)
- Project * -- 1 RateCard (one active card per project)
- Order * -- 1 Project
- BillingLineInstance * -- 1 Order
- BillingLineInstance * -- 1 RateItem
- BillingLineInstance stores snapshot values (historical orders unaffected by Rate Card edits)

**Status values (for entities supporting lifecycle):**

- `active` - available for use
- `deprecated` - still valid for existing references, hidden from new selections
- `archived` - historical only, not selectable

---

# 8. Project Pricing tab (inheritance + controlled overrides + currency/tax)

## 8.1 Responsibilities

The Project Pricing tab is the project's "pricing profile". It:

1. Selects a **currency** for the project (EUR, GBP, USD, etc.)
2. Configures **tax treatment** (tax inclusive vs exclusive, tax rate)
3. Selects a **global Rate Card** (filtered to match project currency) to use as baseline
4. Inherits all values and rules from that card by default
5. Supports **controlled project-level overrides** (negotiated terms, special contractor rates, temporary promos)

## 8.2 Currency and tax settings

**Required fields:**

```
Currency: [EUR|GBP|USD|...] (dropdown, required)
  => Filters available Rate Cards to this currency
  => Immutable after first confirmed order in the project

Tax Treatment: (required)
  o Tax Exclusive (default for B2B)
     Client sees: Line total + tax shown separately
     Invoice shows: Subtotal EUR 1000 + VAT 20% EUR 200 = Total EUR 1200
  
  o Tax Inclusive (for B2C/retail)
     Client sees: Line total already includes tax
     Invoice shows: Total EUR 1000 (includes VAT EUR 166.67)

Tax Rate: [percentage] (editable, defaults by country)
  Example: 20% for UK VAT, 19% for DE, 0% for US

Tax Registration Number: [optional]
  Client's VAT/tax registration number if applicable
```

**Tax calculation note:**

- Regardless of tax mode, Billing Line Instance always stores: `line_client_total_pre_tax`, `tax_amount`, `line_client_total_inc_tax`
- **Launch:** ERP performs simple tax calculation (`line_total × tax_rate`). Tax microservice integration replaces this logic post-launch.
- ERP always stores inputs (`tax_rate`, `tax_treatment`) and outputs (`tax_amount`) regardless of calculation source.

**Why currency at project level:**

- Different clients/markets use different currencies
- Project pricing (including overrides) stays in one currency
- Simplifies reporting and margin calculation

**Why tax at project level:**

- Tax treatment varies by client jurisdiction and type
- B2B clients typically want tax-exclusive (they claim VAT back)
- B2C clients need tax-inclusive pricing
- Same Rate Card works for different tax scenarios

## 8.3 Override principles

- Default is always **inherit from global**
- Overrides are:
  - explicit (easy to see what changed)
  - auditable (who/when/why)
  - permission-controlled
  - constrained by guardrails

**MVP scope:** Project overrides apply to `cost_rate` and `client_rate` only. Rules (minimums) are inherited from Rate Card and cannot be overridden at project level.

Recommended UI/fields for an override:

- Inherited value (read-only reference)
- Overridden value (editable)
- Reason/note (required)
- Effective dates (recommended)

## 8.4 Precedence (stable and explicit)

When calculating a line for an order, precedence is:

1. Global Rate Card value (in project currency)
2. Project Pricing override (if present)
3. Pricing rules (minimums only for MVP) applied to quantity
4. Modifiers (client modifier and cost modifier applied independently)

---

# 9. Project Workflow tab (operational flow)

## 9.1 Responsibilities

The Workflow tab defines the operational flow (timeline) per order, configurable per project. Workflow blocks represent **process steps**, not job type variants.

**Example workflow:**

```text
Order Created → Pro Assigned → Photo Shoot → Retouching → QA Review → Delivery
```

A workflow block:

- Expresses what happens operationally (a step in the process)
- Does **NOT** reference Rate Items (Rate Items reference block types globally — see Section 7.1)
- Does **NOT** store pricing modifiers (modifiers are applied at order level)
- Does **NOT** store quantities (quantities are order-specific, entered at order creation)

**How billing works with workflows (v1.7):**

When creating an order from a workflow, the system resolves billable blocks by looking up Rate Items whose `blockTypes` array includes the block's type. This lookup uses the project's selected Rate Card to filter available Rate Items:

1. For a `PHOTO_SHOOT` block → find Rate Items where `blockTypes` includes `PHOTO_SHOOT`
2. Filter to Rate Items present in the project's Rate Card
3. If exactly one match → auto-select for billing line
4. If multiple matches → operator selects which Rate Item to bill against
5. If no matches → block is operational-only (not billable)

## 9.2 Quantity handling: Order-level only

**Important clarification:**

- **Workflow blocks do NOT store quantity estimates**
- Quantities (hours worked, photos delivered, videos edited) are **entered at order creation/execution**
- Different orders from the same project template will have different quantities

**Rationale:**

- Orders are execution records, quantities are actuals
- The same workflow might produce 2 hours for one client, 5 hours for another
- Storing estimates on blocks creates confusion about what's a default vs requirement vs just a hint

**Where quantities live:**

- Order creation: operator enters quantities when creating/executing the order
- Billing Line Instance: stores the actual quantity used for billing

## 9.3 Order-level modifiers

**Key architectural decision (v1.6):** All modifiers are applied at the **order level**, not at workflow block level.

**Rationale:**

- Workflow blocks are process steps (e.g., "Pro Assigned", "Photo Shoot", "QA Review")
- Modifier conditions (rush, weekend, complexity) apply to the **order as a whole**, not to individual process steps
- The execution context ("this is a rush job") is known only at order creation time

**When creating/executing an order, operators can:**

- Apply modifiers to any billing line (e.g., 1.5x RUSH for Photo Shoot hours)
- Apply different modifiers to different lines if needed
- Use modifier codes from the global catalogue (RUSH, WEEKEND, COMPLEXITY, etc.)

**Benefits:**

- Simpler mental model: one place to configure pricing adjustments
- Workflow stays focused on operational flow
- Full flexibility at execution time
- Clear audit trail: operator made this decision for this order

## 9.4 Separate modifiers for cost and client rates

**Decision:** Cost and client rates have independent modifiers.

Each Billing Line Instance stores two separate modifier sets:

**Client modifier:**

- `client_modifier_value` (decimal, e.g. 1.5 for 1.5x)
- `client_modifier_reason_code` (required if value != 1.0)
- `client_modifier_note` (optional)
- `client_modifier_source` (MANUAL - applied by operator at order creation)

**Cost modifier:**

- `cost_modifier_value` (decimal, e.g. 1.2 for 1.2x)
- `cost_modifier_reason_code` (required if value != 1.0)
- `cost_modifier_note` (optional)
- `cost_modifier_source` (MANUAL - applied by operator at order creation)

**Rationale:**
Client modifiers reflect commercial decisions (rush premium charged to client). Cost modifiers reflect operational reality (contractor weekend uplift, specialist retoucher rate).

**Default:** Both default to 1.0.

**Constraints:** Bounded ranges to prevent pricing chaos. Exact ranges TBD in implementation plan (e.g., client 0.5x-2.0x, cost 0.8x-1.5x).

## 9.5 Modifier reason codes

Reason codes are stored in a `modifier_reason_codes` reference table (`id`, `code`, `display_name`, `active`). New codes can be added via admin UI without code changes.

Examples of reason codes:

- `RUSH` - Rush/urgent delivery
- `WEEKEND` - Weekend/holiday work
- `COMPLEXITY_HIGH` - Above normal complexity
- `COMPLEXITY_LOW` - Below normal complexity
- `REWORK` - Client-requested revision
- `LOYALTY` - Loyalty discount
- `SPECIALIST` - Specialist contractor required

## 9.6 Example: Rush order with modifiers

**Scenario:** A weekend photo shoot that requires rush delivery.

**Workflow steps:**

```text
Order Created → Pro Assigned → Photo Shoot → Retouching → QA → Delivery
```

**Order creation:**

1. Operator creates order from project template
2. Workflow steps are displayed (Pro Assigned, Photo Shoot, etc.)
3. Operator enters quantity for billable step "Photo Shoot": **4 hours**
4. Operator applies modifiers at order level:
   - Client modifier: **1.5x** (reason: RUSH)
   - Cost modifier: **1.2x** (reason: WEEKEND)
5. System calculates billing line with modifiers applied

**Result:** Photo Shoot billing line shows 4 hours @ (base rate × 1.5x client / 1.2x cost)

## 9.7 Example: Standard order without modifiers

**Scenario:** A normal weekday photo shoot with no special conditions.

**Order creation:**

1. Operator creates order from project template
2. Enters quantity for "Photo Shoot": **2 hours**
3. No modifiers applied (defaults remain 1.0x)
4. System calculates billing line at base rates

---

# 10. Orders (execution + actuals + billing outputs)

## 10.1 Responsibilities

Orders are the execution layer. They:

- use the project's currency and tax settings
- use the project's selected Rate Card + project overrides
- use the project's workflow structure (blocks)
- require operator to enter actual quantities when creating/executing the order
- apply workflow block default modifiers (with option to override)
- generate and store the final priced lines (billing line instances) with an audit trail

## 10.2 Order creation workflow

**Typical flow:**

1. Operator creates order from project template
2. Selects which workflow blocks to execute
3. **Enters quantities for each block** (hours, photos, videos, etc.)
4. System applies:
   - Rate Card rates (or project overrides if present)
   - Workflow block default modifiers (if configured)
5. Operator can adjust modifiers if needed
6. System calculates billing line instances
7. Order confirmed => billing lines locked

**Order state machine:** Defined in separate implementation epic. This spec defines pricing calculation inputs/outputs and immutability requirements only.

## 10.3 Order-level adjustments (manual lines)

Order-level adjustments are allowed **only** via controlled Billing Line Types (no free text), for example:

- Travel fee
- Licensing fee
- Project management fee
- Discount
- Goodwill credit

**Terminology note:** These may also be referred to as "manual lines" (lines added by operators during order processing, as opposed to lines automatically generated from workflow blocks). Both terms describe the same concept: additional billing lines constrained to the Billing Line Types catalogue.

These are stored as normal billing line instances with their own rate source and audit trail.

---

# 11. Pricing calculation pipeline (final decision)

## 11.1 Decision: Rules => then Modifiers

We apply **pricing rules to quantity first**, then apply modifiers.

**Rationale:** Rules define the commercial product structure (what you're actually selling), while modifiers adjust pricing for execution context (how it's delivered). This prevents edge cases where modifiers accidentally trigger or bypass structural constraints, and ensures premiums/discounts apply to actual billable units rather than initial requests.

### Pipeline (per line)

1. **Resolve baseline rates**
   - Start from Rate Card (in project currency)
   - Apply Project Pricing override if present
   - Result: effective_cost_rate, effective_client_rate (before rules/modifiers)

2. **Determine applicable pricing rules**
   - MVP: Minimums only (e.g. "photographer minimum 2 hours")
   - Future: Packages, tiers, bulk discounts

3. **Apply rules to quantity**
   - Transform requested quantity to billable quantity
   - Example: 1.5 hours requested => minimum 2 hours = 2 hours billable
   - Result: quantity_effective (post-rules)

4. **Apply modifiers (independently for cost and client)**
   - Source: applied by operator at order creation
   - Client: effective_client_rate x client_modifier_value = final_client_rate
   - Cost: effective_cost_rate x cost_modifier_value = final_cost_rate
   - Requires reason code if modifier != 1.0

5. **Calculate line totals (pre-tax)**
   - line_cost_total = final_cost_rate x quantity_effective
   - line_client_total_pre_tax = final_client_rate x quantity_effective
   - line_margin = line_client_total_pre_tax - line_cost_total

6. **Calculate tax (based on project settings)**
   - If tax exclusive:
     - tax_amount = line_client_total_pre_tax x tax_rate
     - line_client_total_inc_tax = line_client_total_pre_tax + tax_amount
   - If tax inclusive:
     - line_client_total_inc_tax = line_client_total_pre_tax (already includes tax)
     - tax_amount = line_client_total_inc_tax x (tax_rate / (1 + tax_rate))
     - line_client_total_pre_tax = line_client_total_inc_tax - tax_amount

7. **Store on Billing Line Instance** (see Section 12)

### Example calculation walkthrough

**Scenario:**

- Project currency: EUR
- Project tax: Exclusive, 20% VAT
- Rate Item: Photographer Hour
- Rate Card: Standard EUR (EUR 50 cost, EUR 100 client, min 2 hours)
- Project Override: EUR 120 client rate (negotiated contract)
- Workflow step: "Photo Shoot" (operator applies 1.2x WEEKEND client modifier, 1.15x WEEKEND cost modifier)
- Order quantity entered: 1.5 hours

**Step-by-step:**

1. **Resolve baseline rates:**
   - base_cost_rate: EUR 50 (from Rate Card)
   - base_client_rate: EUR 100 (from Rate Card)
   - effective_cost_rate: EUR 50 (no override)
   - effective_client_rate: EUR 120 (project override applied)

2. **Determine rules:**
   - Minimum 2 hours rule applies

3. **Apply rules:**
   - quantity_input: 1.5 hours
   - quantity_effective: 2 hours (minimum applied)
   - applied_rules_snapshot: `{"minimum": 2, "unit": "hours"}`

4. **Apply modifiers:**
   - Client: EUR 120 x 1.2 = EUR 144 (final_client_rate)
   - Cost: EUR 50 x 1.15 = EUR 57.50 (final_cost_rate)

5. **Calculate line totals (pre-tax):**
   - line_cost_total: EUR 57.50 x 2 = EUR 115
   - line_client_total_pre_tax: EUR 144 x 2 = EUR 288
   - line_margin: EUR 288 - EUR 115 = EUR 173

6. **Calculate tax (exclusive):**
   - tax_amount: EUR 288 x 0.20 = EUR 57.60
   - line_client_total_inc_tax: EUR 288 + EUR 57.60 = EUR 345.60

7. **Store:** All values saved to Billing Line Instance with audit trail

**Invoice shows:**

```
Photo Shoot (Weekend): 2 hours @ EUR 144/hr = EUR 288.00
VAT (20%):                                  EUR 57.60
                                          ________
Total:                                     EUR 345.60
```

---

# 12. Billing Line Instance (order record) is the source of truth

Each order stores Billing Line Instances that represent the final priced outcome.

## 12.1 Minimum required fields (audit trail)

Each Billing Line Instance must store enough information to explain the number later, even if global rates change.

Required fields (conceptual):

- **Identifiers:**
  - billing_line_instance_id
  - order_id
  - billing_line_type_id
  - rate_item_id (resolved)
  - rate_card_id (selected)

- **Currency and tax context:**
  - currency (EUR, GBP, USD, etc.)
  - tax_treatment (EXCLUSIVE | INCLUSIVE)
  - tax_rate (decimal, e.g. 0.20 for 20%)

- **Rate source tracking:**
  - rate_source (enum)
    - `rate_card` - from global Rate Card
    - `project_override` - from Project Pricing tab override
    - `manual` - operator-added line (order-level adjustment)

- **Base rates (from Rate Card):**
  - base_cost_rate
  - base_client_rate

- **Override rates (if applied from Project Pricing):**
  - override_cost_rate (null if not overridden)
  - override_client_rate (null if not overridden)

- **Effective rates (after override selection, before rules/modifiers):**
  - effective_cost_rate
  - effective_client_rate

- **Rules application:**
  - applied_rules_snapshot (JSON)
    - All rules JSON must include `schema_version` and `rule_type` for forward compatibility.
    - Example:

      ```json
      {
        "schema_version": 1,
        "rule_type": "minimum",
        "minimum": 2,
        "unit": "hours"
      }
      ```

- **Quantity tracking:**
  - quantity_input (raw request, entered by operator)
  - quantity_effective (after rules applied)

- **Client modifier application:**
  - client_modifier_value (decimal, e.g. 1.2 for 1.2x)
  - client_modifier_reason_code (required if value != 1.0)
  - client_modifier_note (optional free text)
  - client_modifier_source (enum: MANUAL)

- **Cost modifier application:**
  - cost_modifier_value (decimal, e.g. 1.15 for 1.15x)
  - cost_modifier_reason_code (required if value != 1.0)
  - cost_modifier_note (optional free text)
  - cost_modifier_source (enum: MANUAL)

- **Final rates (after all adjustments):**
  - final_cost_rate
  - final_client_rate

- **Line totals:**
  - line_cost_total
  - line_client_total_pre_tax
  - tax_amount (calculated)
  - line_client_total_inc_tax
  - line_margin (calculated: line_client_total_pre_tax - line_cost_total)

- **Status and audit metadata:**
  - status (enum: draft | confirmed | voided)
  - created_at (timestamp)
  - created_by (user ID)
  - confirmed_at (timestamp, if applicable)
  - confirmed_by (user ID, if applicable)
  - voided_at (timestamp, if applicable)
  - voided_by (user ID, if applicable)
  - void_reason (if applicable)

This data powers:

- Finance reconciliation
- Profitability reporting
- Dispute resolution
- Historical consistency
- Rate change impact analysis
- Tax reporting and compliance

## 12.2 Immutability rules

- **Draft BLIs:** May be edited or deleted
- **Confirmed BLIs:** Immutable. Cannot be edited or deleted.
- **Corrections:** Create adjustment/credit lines with audit reason; do not mutate confirmed records
- **Voiding:** Use `status=voided` with void_reason; record remains for audit trail

---

# 13. Cost vs client price (margin model)

Each service component supports two parallel rates:

- **Cost rate**: contractor payout or internal AI cost
- **Client rate**: what we charge for that component

Margin:

- component margin = (final_client_rate - final_cost_rate) x quantity_effective
- order margin = sum of component margins (plus/minus adjustments)

Cost and client rates have **independent modifiers** (see Section 9.4), allowing for:

- Different cost/client rate overrides per project
- Independent modifier application to cost vs client
- Full margin visibility at every level

**Note:** Margin is calculated on pre-tax amounts. Tax is a pass-through to the client and does not affect profitability.

---

# 14. Analytics and reporting requirements

The system must support the following core analytics queries from day one. These requirements directly affect the data model and cannot be retrofitted later.

**Note:** Cross-currency aggregation queries require FX integration (see Appendix C.5). Until then, analytics are per-currency only.

## 14.1 Pricing effectiveness

**Must be able to answer:**

1. **Margin by Rate Item:**
   - "What's our margin on Photographer Hours this quarter?"
   - Query: `GROUP BY rate_item_id, SUM(line_margin)`

2. **Margin by Rate Card:**
   - "Which Rate Card (Standard vs Premium vs Client-specific) is most profitable?"
   - Query: `GROUP BY rate_card_id, SUM(line_margin)`

3. **Margin by currency:**
   - "What's our EUR business margin vs GBP business margin?"
   - Query: `GROUP BY currency, SUM(line_margin)`

4. **Margin by tax treatment:**
   - "Does B2B (tax exclusive) vs B2C (tax inclusive) affect our profitability?"
   - Query: `GROUP BY tax_treatment, SUM(line_margin)`

## 14.2 Override governance

**Must be able to answer:**

1. **Override usage rate:**
   - "What % of orders use project pricing overrides?"
   - Query: `COUNT(DISTINCT order_id WHERE rate_source = 'project_override') / COUNT(DISTINCT order_id)`

2. **Override variance:**
   - "What's the average variance between global rates and project overrides?"
   - Query: `AVG((override_client_rate - base_client_rate) / base_client_rate) WHERE rate_source = 'project_override'`

3. **Most overridden Rate Items:**
   - "Which services get overridden most often?"
   - Query: `GROUP BY rate_item_id WHERE rate_source = 'project_override', COUNT(*)`

4. **Override revenue impact:**
   - "How much revenue did we gain/lose due to project overrides?"
   - Query: `SUM((override_client_rate - base_client_rate) x quantity_effective) WHERE rate_source = 'project_override'`

## 14.3 Modifier patterns

**Must be able to answer:**

1. **Modifier usage rate:**
   - "What % of orders use modifiers?"
   - Query: `COUNT(DISTINCT order_id WHERE client_modifier_value != 1.0 OR cost_modifier_value != 1.0) / COUNT(DISTINCT order_id)`

2. **Modifier distribution by type:**
   - "How often do we use RUSH vs WEEKEND vs COMPLEXITY modifiers?"
   - Query: `GROUP BY client_modifier_reason_code, COUNT(*)`

3. **Modifier usage by reason:**
   - "How often are modifiers applied for each reason?"
   - Query: `GROUP BY client_modifier_reason_code, COUNT(*)`

4. **Modifier revenue impact:**
   - "How much additional revenue do client modifiers generate?"
   - Query: `SUM(line_client_total_pre_tax x (client_modifier_value - 1.0)) WHERE client_modifier_value > 1.0`

## 14.4 Pricing consistency

**Must be able to answer:**

1. **Effective rate variance:**
   - "How many different effective rates exist for 'Photographer Hour'?"
   - Query: `GROUP BY rate_item_id, COUNT(DISTINCT final_client_rate)`

2. **Rate drift over time:**
   - "Are we drifting away from standard pricing?"
   - Query: `GROUP BY MONTH(created_at), AVG(final_client_rate / base_client_rate) WHERE rate_item_id = X`

3. **Rules application frequency:**
   - "How often do minimum rules apply?"
   - Query: Parse `applied_rules_snapshot` JSON, `GROUP BY rule_type, COUNT(*)`

## 14.5 Performance and operational metrics

**Must be able to answer:**

1. **Revenue by Billing Line Type:**
   - "How much revenue does each service category generate?"
   - Query: `GROUP BY billing_line_type_id, SUM(line_client_total_inc_tax)`

2. **Cost by Billing Line Type:**
   - "What are our largest cost centers?"
   - Query: `GROUP BY billing_line_type_id, SUM(line_cost_total)`

3. **Order value distribution:**
   - "What's the average order value? Median? 90th percentile?"
   - Query: `SELECT AVG(order_total), PERCENTILE(order_total, 0.5), PERCENTILE(order_total, 0.9)`

4. **Tax collected:**
   - "How much VAT/tax did we collect this quarter?"
   - Query: `SUM(tax_amount) GROUP BY tax_rate, currency`

## 14.6 Data model implications

To support these queries efficiently, the Billing Line Instance schema must include proper indexes on:

- rate_item_id
- rate_card_id
- billing_line_type_id
- currency
- tax_treatment
- client_modifier_reason_code
- cost_modifier_reason_code
- created_at (for time-series queries)

---

# 15. Guardrails (prevent pricing chaos)

- **No free-text billable lines**
  - All billing lines must reference a Billing Line Type from the global catalogue
  - Manual/order-level adjustments are constrained to approved line types

- **Billing Line Types are a controlled global catalogue**
  - Prevents "custom one-off" lines that break analytics
  - Ensures consistent reporting and forecasting

- **Multi-currency discipline**
  - Rate Cards are single-currency (no mixing within a card)
  - Projects select currency, which filters available Rate Cards
  - Project currency immutable after first confirmed order
  - No automatic currency conversion (prevents hidden exchange rate issues)

- **Tax handling at project level**
  - Tax treatment (inclusive/exclusive) configured once per project
  - Consistent tax calculation across all orders in project
  - Supports proper tax reporting and compliance

- **Project overrides:**
  - Explicit and visible (side-by-side with inherited values)
  - Reason required (mandatory field)
  - Permission-controlled (role-based access)
  - Effective dates recommended (for temporary contracts)

- **Modifiers:**
  - Separate client and cost modifiers (independent application)
  - Bounded ranges (exact constraints TBD in implementation plan)
  - Reason-coded (from controlled list)
  - Applied at order level (operator decision)
  - Auditable (stored on Billing Line Instance)
  - Permission-controlled (tighter bounds for most users)

- **Orders store final Billing Line Instances with audit trail**
  - Confirmed BLIs are immutable
  - Historical data preserved via status changes, not mutations
  - Full transparency for disputes and audits

- **Entity lifecycle management**
  - Use status (active/deprecated/archived), not deletion
  - IDs remain stable; display names may change
  - Historical records keep snapshots anyway

---

# 16. Scaling across delivery modes

Supported compositions:

- **Fully AI**
  - per asset / per video / per minute
  - future: packages, bulk discounts, tiers
- **Fully human**
  - hourly, per deliverable, day rates
  - future: packages
  - varies by talent tier and client tier
- **AI + human retoucher/editor**
  - AI processing + human review/edits (per image, hourly)
- **Photographer + AI enhancement**
  - shoot time + AI processing + optional human QA/retouch

Why this remains manageable:

- Rate Cards centralise cost and client pricing per currency
- Workflow blocks template common scenarios (including rush/weekend patterns)
- Order execution captures actual quantities and modifiers
- New units/rules are added by extending rate items/cards/rules, not workflow logic

---

# 17. Integrations and boundaries (non-goals)

This spec defines the **pricing calculation engine** within the ERP. The following are explicitly **out of scope** and owned by external microservices:

**Out of scope (external services):**

- **Tax calculation logic** - ERP stores inputs and results; tax service owns calculation
- **Invoice generation** - ERP exports totals; invoicing service creates documents
- **Payment processing** - external payment system
- **Contractor payout management** - external payroll/payout system
- **Accounting entries / revenue recognition** - external accounting system
- **FX rate sourcing** - external FX service (ERP stores rates when provided)

**ERP stores from external services:**

- Service IDs (e.g., invoice_id, payment_id)
- Returned totals and timestamps
- Inputs used for calculation (for audit)

**Acceptance criteria:** Defined in implementation plan, not this spec.

---

# 18. Edge case handling

## 18.1 Entity renames and deprecations

- **Never "change history"** - use status transitions, not deletions
- **Status values:** active => deprecated => archived
- **Renames allowed:** Display name changes are cosmetic; IDs remain stable
- **Historical records:** Keep snapshots anyway (Billing Line Instances store all values at time of creation)

## 18.2 Zero-quantity lines

- **Allowed.** Meaning: free line, placeholder, or included service
- Still produces an auditable Billing Line Instance with totals = 0
- Requires explicit operator action (not auto-generated)

## 18.3 Negative quantities / credits

- **Allowed.** Treat as credit, refund, or marketing comp
- Require reason code (from controlled list)
- May require approval (defined in permissions, implementation plan)
- Produces Billing Line Instance with negative totals

## 18.4 Project currency changes

- **Immutable after first confirmed order**
- Before first order: currency can be changed (Rate Card selection updates accordingly)
- After first confirmed order: locked. Create new project if different currency needed.

## 18.5 Rate Card changes after project selection

- **Allowed:** Project can change Rate Card selection
- **Effect:** Only affects new orders; existing orders keep their snapshot values
- **Order-level:** Order stores `rate_card_id` at creation time; BLIs store snapshot values

## 18.6 Conflicting rules

- **Treat as validation error**
- Conflicting rules block saving the Rate Card entry
- Operations must resolve conflicts before pricing can be used
- MVP: Only minimums supported, so conflicts unlikely

---

## Appendix A: Version history

**v1.7 (2026-02-09)**

- **BREAKING CHANGE:** Moved Rate Item ↔ Workflow Block association from WorkflowBlock to RateItem (Section 7.1, 7.4 ERD)
- Added `blockTypes?: WorkflowBlockType[]` field to RateItem entity — defines which workflow block types this Rate Item can bill against
- Relationship is **many-to-many**: one Rate Item → multiple block types, one block type → multiple Rate Items
- Removed `rate_item_id` / `WorkflowBlockPricing` from WorkflowBlock entity — blocks are now purely operational
- Rate Items without `blockTypes` are used for manual/order-level billing lines only
- Updated workflow block responsibilities: blocks no longer reference Rate Items at all (Section 9.1)
- Added billing resolution flow at order creation (Section 9.1): system resolves billable blocks by cross-referencing Rate Item `blockTypes` with project's Rate Card
- Updated ERD to reflect new relationship direction (Section 7.4)
- Updated glossary entries for Rate Item and Workflow Block (Appendix B)

**Implementation Notes (v1.7):**

> The following code changes are required to align with this spec version:
>
> 1. **Add `blockTypes` to `RateItem` interface** in `src/types/pricing.ts`:
>    - Add optional field: `blockTypes?: WorkflowBlockType[]`
>
> 2. **Delete `WorkflowBlockPricing` interface** from `src/types/pricing.ts`
>
> 3. **Remove `pricing` field** from `WorkflowBlock` interface in `src/types/workflow.ts`
>
> 4. **Delete `BlockPricingPanel.tsx`** from `src/components/ProjectPage/WorkflowBuilder/`
>
> 5. **Add block type selector to `RateItemModal.tsx`** — multi-select using `BILLABLE_BLOCK_TYPES` constant
>
> 6. **Add `BILLABLE_BLOCK_TYPES` constant** to `src/data/pricing-constants.ts`
>
> 7. **Clean up `BlockSettingsPanel.tsx`, `WorkflowBuilder.tsx`, `useWorkflowBuilder.ts`** — remove all pricing state, handlers, and props
>
> 8. **Update `CanvasBlockCard.tsx`** — resolve pricing indicator from Rate Item registry instead of `block.pricing`
>
> See `implementation-plan-rate-item-block-linking.md` for full phased plan.

**v1.6 (2026-02-06)**

- **BREAKING CHANGE:** Simplified modifier architecture - all modifiers now apply at order level only
- Removed workflow block default modifiers (Section 9.3)
- Updated WorkflowBlock entity to remove modifier fields (Section 7.4 ERD)
- Changed `modifier_source` enum from `(FROM_BLOCK_DEFAULT, MANUAL_OVERRIDE, MANUAL_ADDITION)` to `(MANUAL)`
- **BREAKING CHANGE:** Removed BillingLineType entity - workflow blocks and billing lines now reference RateItem directly (Section 7.3, 7.4)
- Clarified workflow blocks are process steps, not job type variants
- Updated calculation pipeline and examples to reflect order-level modifiers
- Updated analytics queries to remove block-level modifier source analysis

**Implementation Notes (v1.6):**

> The following code changes are required to align with this spec version:
>
> 1. **Update `ModifierSource` type** in `src/types/pricing.ts`:
>    - Change from `'FROM_BLOCK_DEFAULT' | 'MANUAL_OVERRIDE' | 'MANUAL_ADDITION'` to `'MANUAL'`
>
> 2. **Remove block pricing UI** (currently exists but should be deleted):
>    - `src/components/ProjectPage/WorkflowBuilder/BlockPricingPanel.tsx`
>    - `src/components/ProjectPage/WorkflowBuilder/BlockPricingEditModal.tsx`
>    - `src/components/ProjectPage/WorkflowBuilder/WorkflowPricingSummary.tsx`
>    - `src/hooks/useWorkflowBlockPricing.ts`
>
> 3. **Update `WorkflowBlockPricing` interface** in `src/types/pricing.ts`:
>    - Remove `defaultClientModifier`, `defaultClientModifierReasonCode`
>    - Remove `defaultCostModifier`, `defaultCostModifierReasonCode`
>    - Keep only `rateItemId` for linking billable blocks to Rate Items

**v1.5 (2026-01-27)**

- Editorial improvements and clarifications

**v1.4 (2026-01-27)**

- Added Entity Relationship Diagram (Section 7.4)
- Split single modifier into separate client_modifier and cost_modifier (Section 9.4, 12.1)
- Added non-goals / integration boundaries section (Section 17)
- Added edge case handling section (Section 18)
- Clarified Rate Card is single-currency with naming convention (Section 7.2)
- Added BLI status field with immutability rules (Section 12.2)
- Clarified project currency immutability after first confirmed order
- Removed implementation recommendations (moved to Appendix C)
- Removed Phase 2/3 analytics roadmap (Section 14.7)
- Added ERD with relationship cardinalities
- Updated calculation example for separate cost/client modifiers

**v1.3 (2026-01-26)**

- Added multi-currency support (Section 7.2, 8.2)
- Added tax/VAT handling at project level (Section 8.2)
- Clarified quantity handling: order-level only, not on workflow blocks (Section 9.2)
- Clarified modifier approach: hybrid with optional block defaults + order overrides (Section 9.3)
- Added modifier source tracking (FROM_BLOCK_DEFAULT, MANUAL_OVERRIDE, MANUAL_ADDITION)
- Added comprehensive analytics and reporting requirements (Section 14)
- Updated Billing Line Instance schema with currency, tax, modifier_source fields (Section 12.1)
- Updated calculation pipeline to include tax calculation (Section 11.1)
- Updated guardrails section with multi-currency and tax discipline (Section 15)

**v1.2 (2026-01-26)**

- Corrected calculation pipeline order: Rules => then Modifiers (Section 11.1)
- Added explicit modifier constraints: 0.5x to 2.0x range (Section 9.3)
- Clarified modifier location: block attribute configured in Project settings (Section 9.2)
- Added terminology clarification: "manual lines" = "order-level adjustments" (Section 10.2)
- Added detailed calculation walkthrough example (Section 11.1)
- Improved precedence clarity in Section 8.3
- Enhanced Billing Line Instance field descriptions (Section 12.1)

**v1.1 (2026-01-26)**

- Initial version consolidating pricing architecture decisions

---

## Appendix B: Glossary

**Rate Item:** Atomic pricing unit (e.g. "Photographer Hour") - defines name, unit type, and optionally associated workflow block types. No values stored here.

**Rate Card:** Complete pricing package for a segment in a single currency - contains cost rates, client rates, and rules for all Rate Items

**Rate Card Entry:** A single rate item's values within a rate card (cost rate, client rate, rules)

**Project Pricing Override:** Contract-specific rate adjustment at project level - explicit, auditable, permission-controlled

**Workflow Block:** Operational step in a project workflow - represents a process stage (e.g., Pro Assigned, Photo Shoot, Retouching). Purely operational — does not reference Rate Items. Billing associations are defined on the Rate Item side via `blockTypes`.

**Order-Level Modifier:** Multiplier applied during order creation by operator. Stored on Billing Line Instance with reason code.

**Client Modifier:** Multiplier applied to client rate for commercial reasons (rush premium, loyalty discount)

**Cost Modifier:** Multiplier applied to cost rate for operational reasons (contractor weekend rate, specialist uplift)

**Modifier Source:** Where a modifier came from (MANUAL - applied by operator at order creation)

**Billing Line Instance:** Final priced line stored on an order - source of truth with complete audit trail

**Pricing Rules:** Structural constraints that define product shape (MVP: minimums only; future: packages, tiers)

**Effective Rate:** Rate after override selection but before rules/modifiers

**Final Rate:** Rate after all adjustments (overrides + modifiers)

**Quantity Input:** Raw requested quantity entered by operator at order creation

**Quantity Effective:** Billable quantity after rules applied

**Tax Exclusive:** Tax shown separately from line total (typical for B2B)

**Tax Inclusive:** Tax included in line total (typical for B2C)

**Line Margin:** Difference between client price and cost price (pre-tax)

**Manual Lines:** Billing lines added by operators (not from workflow blocks) - constrained to Billing Line Types catalogue

---

## Appendix C: Open questions for implementation planning

The following questions are **not blockers for architecture** but must be resolved during implementation planning.

### C.1 Bulk discounts / packages modelling (future)

Confirm whether implemented purely as Rate Card rules or with explicit "package" rate items.

Options:

- **Option A:** Single Rate Item "Photo Retouching" with package rules (1-9: EUR X, 10-pack: EUR Y)
- **Option B:** Separate Rate Items: "Photo Retouch Single", "Photo Retouch 10-Pack", "Photo Retouch 50-Pack"

### C.2 Tiering modelling (future)

Confirm whether tiers are separate rate items or tier rules under a single item.

Options:

- **Option A:** Single Rate Item "AI Photo Generation" with tier rules (1-500: EUR 0.50, 501+: EUR 0.35)
- **Option B:** Separate Rate Items: "AI Photo (Standard Tier)", "AI Photo (Bulk Tier)"

### C.3 Permissions

Define which roles can create project overrides and apply modifiers, and what approval flow exists (if any).

MVP: Admin-only write access for Rate Cards/Rate Items/Billing Line Types. Role management is a separate epic.

### C.4 Amendment handling

Define how pricing changes after order confirmation are handled.

Questions:

- How are client approvals/re-approvals handled for amended orders?
- Do amendments create new line instances or adjustment lines?

Recommendation: Confirmed BLIs are immutable. Amendments create adjustment lines with reference to original, preserving full audit trail.

### C.5 Currency exchange rate tracking

For reporting and analytics across currencies:

Questions:

- Do we need to report "total revenue in reporting currency" across all currencies?
- If yes, which exchange rate source? (FX microservice)
- Lock exchange rates at order creation or invoice date?

Recommendation: Define single reporting currency at org level. Reserve `fx_rate_to_reporting` and `fx_rate_timestamp` fields on Order. Store null until FX service integration.

### C.6 Rounding and precision

Define rounding rules to prevent accumulating errors:

Questions:

- When to round? (after each step? only final totals?)
- Rounding method? (banker's rounding? always up? standard?)
- Decimal precision for rates? (2 decimals? 4 decimals?)
- Decimal precision for quantities? (hours: 0.25 increments? photos: integers only?)

### C.7 Modifier range constraints

Define exact bounded ranges for modifiers:

Questions:

- Client modifier range? (proposed: 0.5x to 2.0x)
- Cost modifier range? (proposed: 0.8x to 1.5x)
- Which roles can exceed standard ranges?
- Approval flow for out-of-range modifiers?

---
