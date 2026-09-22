# Database Entity Relationship Diagram

Auto-generated from Sequelize models.

## Entities

### user (`users`)

| Column | Type | Constraints |
|--------|------|-------------|
| `user_id` | uuid | PK, NOT NULL, DEFAULT DataTypes.UUIDV4 |
| `name` | varchar | NOT NULL |
| `email` | varchar | NOT NULL, UNIQUE |
| `password_hash` | varchar | NOT NULL |

### group (`groups`)

| Column | Type | Constraints |
|--------|------|-------------|
| `group_id` | uuid | PK, NOT NULL, DEFAULT DataTypes.UUIDV4 |
| `created_by` | uuid | NOT NULL |
| `name` | varchar | NOT NULL |
| `icon` | varchar | — |
| `description` | varchar | — |

### groupmember (`group_members`)

| Column | Type | Constraints |
|--------|------|-------------|
| `group_member_id` | uuid | PK, NOT NULL, DEFAULT DataTypes.UUIDV4 |
| `group_id` | uuid | FK, NOT NULL |
| `user_id` | uuid | FK, NOT NULL |
| `role` | enum | NOT NULL, DEFAULT "member" |
| `joined_at` | timestamp | NOT NULL, DEFAULT DataTypes.NOW |

### expense (`expenses`)

| Column | Type | Constraints |
|--------|------|-------------|
| `expense_id` | uuid | PK, NOT NULL, DEFAULT DataTypes.UUIDV4 |
| `group_id` | uuid | FK, NOT NULL |
| `paid_by` | uuid | NOT NULL |
| `description` | varchar | NOT NULL |
| `amount` | decimal | NOT NULL |
| `expense_date` | date | NOT NULL |

### expensesplit (`expense_splits`)

| Column | Type | Constraints |
|--------|------|-------------|
| `expense_split_id` | uuid | PK, NOT NULL, DEFAULT DataTypes.UUIDV4 |
| `expense_id` | uuid | FK, NOT NULL |
| `user_id` | uuid | FK, NOT NULL |
| `share_amount` | decimal | NOT NULL |

### payment (`payments`)

| Column | Type | Constraints |
|--------|------|-------------|
| `payment_id` | uuid | PK, NOT NULL, DEFAULT DataTypes.UUIDV4 |
| `group_id` | uuid | FK, NOT NULL |
| `paid_by` | uuid | NOT NULL |
| `paid_to` | uuid | NOT NULL |
| `amount` | decimal | NOT NULL |
| `payment_date` | date | NOT NULL |
| `note` | varchar | — |

### expensereaction (`expense_reactions`)

| Column | Type | Constraints |
|--------|------|-------------|
| `reaction_id` | uuid | PK, NOT NULL, DEFAULT DataTypes.UUIDV4 |
| `expense_id` | uuid | FK, NOT NULL |
| `user_id` | uuid | FK, NOT NULL |
| `reaction` | varchar | NOT NULL |

### activitylog (`activity_logs`)

| Column | Type | Constraints |
|--------|------|-------------|
| `activity_id` | uuid | PK, NOT NULL, DEFAULT DataTypes.UUIDV4 |
| `group_id` | uuid | FK, NOT NULL |
| `user_id` | uuid | FK, NOT NULL |
| `action` | varchar | NOT NULL |
| `description` | text | NOT NULL |

## Relationships

### ONE TO MANY

- **User** → **Group**
  - Foreign Key: `created_by`
  - Alias: `createdGroups`

- **User** → **GroupMember**
  - Foreign Key: `user_id`
  - Alias: `groupMemberships`

- **Group** → **GroupMember**
  - Foreign Key: `group_id`
  - Alias: `members`

- **Group** → **Expense**
  - Foreign Key: `group_id`
  - Alias: `expenses`

- **User** → **Expense**
  - Foreign Key: `paid_by`
  - Alias: `paidExpenses`

- **Expense** → **ExpenseSplit**
  - Foreign Key: `expense_id`
  - Alias: `splits`

- **User** → **ExpenseSplit**
  - Foreign Key: `user_id`
  - Alias: `expenseSplits`

- **Group** → **Payment**
  - Foreign Key: `group_id`
  - Alias: `payments`

- **User** → **Payment**
  - Foreign Key: `paid_by`
  - Alias: `sentPayments`

- **User** → **Payment**
  - Foreign Key: `paid_to`
  - Alias: `receivedPayments`

- **Expense** → **ExpenseReaction**
  - Foreign Key: `expense_id`
  - Alias: `reactions`

- **User** → **ExpenseReaction**
  - Foreign Key: `user_id`
  - Alias: `expenseReactions`

- **Group** → **ActivityLog**
  - Foreign Key: `group_id`
  - Alias: `activities`

- **User** → **ActivityLog**
  - Foreign Key: `user_id`
  - Alias: `activities`

### MANY TO ONE

- **Group** → **User**
  - Foreign Key: `created_by`
  - Alias: `creator`

- **GroupMember** → **User**
  - Foreign Key: `user_id`
  - Alias: `user`

- **GroupMember** → **Group**
  - Foreign Key: `group_id`
  - Alias: `group`

- **Expense** → **Group**
  - Foreign Key: `group_id`
  - Alias: `group`

- **Expense** → **User**
  - Foreign Key: `paid_by`
  - Alias: `payer`

- **ExpenseSplit** → **Expense**
  - Foreign Key: `expense_id`
  - Alias: `expense`

- **ExpenseSplit** → **User**
  - Foreign Key: `user_id`
  - Alias: `user`

- **Payment** → **Group**
  - Foreign Key: `group_id`
  - Alias: `group`

- **Payment** → **User**
  - Foreign Key: `paid_by`
  - Alias: `payer`

- **Payment** → **User**
  - Foreign Key: `paid_to`
  - Alias: `receiver`

- **ExpenseReaction** → **Expense**
  - Foreign Key: `expense_id`
  - Alias: `expense`

- **ExpenseReaction** → **User**
  - Foreign Key: `user_id`
  - Alias: `user`

- **ActivityLog** → **Group**
  - Foreign Key: `group_id`
  - Alias: `group`

- **ActivityLog** → **User**
  - Foreign Key: `user_id`
  - Alias: `user`

### MANY TO MANY

- **User** ↔ **Group** (through **GroupMember**)
  - User.user_id → GroupMember.user_id
  - Group.group_id → GroupMember.group_id
  - Alias: `groups`

- **Group** ↔ **User** (through **GroupMember**)
  - Group.group_id → GroupMember.group_id
  - User.user_id → GroupMember.user_id
  - Alias: `groupUsers`

- **User** ↔ **Expense** (through **ExpenseSplit**)
  - User.user_id → ExpenseSplit.user_id
  - Expense.expense_id → ExpenseSplit.expense_id
  - Alias: `splitExpenses`

- **Expense** ↔ **User** (through **ExpenseSplit**)
  - Expense.expense_id → ExpenseSplit.expense_id
  - User.user_id → ExpenseSplit.user_id
  - Alias: `splitWithUsers`

- **User** ↔ **Expense** (through **ExpenseReaction**)
  - User.user_id → ExpenseReaction.user_id
  - Expense.expense_id → ExpenseReaction.expense_id
  - Alias: `reactedExpenses`

- **Expense** ↔ **User** (through **ExpenseReaction**)
  - Expense.expense_id → ExpenseReaction.expense_id
  - User.user_id → ExpenseReaction.user_id
  - Alias: `reactors`

