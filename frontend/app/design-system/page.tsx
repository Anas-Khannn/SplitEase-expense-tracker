"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  Inbox,
  Edit,
  Search,
} from "lucide-react";
import {
  Button,
  Input,
  Textarea,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Badge,
  Avatar,
  IconButton,
  Modal,
  ConfirmDialog,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Skeleton,
  EmptyState,
  ErrorState,
} from "@/components/ui";

export default function DesignSystemDemo() {
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmDangerOpen, setConfirmDangerOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setConfirmOpen(false);
      setConfirmDangerOpen(false);
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-base py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-12">
        <div>
          <h1 className="text-display font-bold text-text-primary">
            Design System
          </h1>
          <p className="mt-2 text-body text-text-secondary">
            SplitEase UI component library verification page
          </p>
        </div>

        {/* ── Button ── */}
        <section>
          <h2 className="text-h2 font-semibold text-text-primary mb-4">
            Button
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="primary" loading>
              Loading
            </Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
            <Button variant="primary" icon={<Plus />}>
              With Icon
            </Button>
            <Button variant="primary" size="sm">
              Small
            </Button>
            <Button variant="primary" size="lg">
              Large
            </Button>
            <Button variant="primary" fullWidth>
              Full Width
            </Button>
          </div>
        </section>

        {/* ── Input ── */}
        <section>
          <h2 className="text-h2 font-semibold text-text-primary mb-4">
            Input
          </h2>
          <div className="max-w-md space-y-4">
            <Input label="Email" placeholder="you@example.com" type="email" />
            <Input
              label="With helper"
              placeholder="Enter a value"
              helperText="This is helper text"
            />
            <Input
              label="With error"
              placeholder="Enter a value"
              error="This field is required"
            />
            <Input label="Disabled" placeholder="Disabled" disabled />
            <Input label="Required" placeholder="Required" required />
          </div>
        </section>

        {/* ── Textarea ── */}
        <section>
          <h2 className="text-h2 font-semibold text-text-primary mb-4">
            Textarea
          </h2>
          <div className="max-w-md space-y-4">
            <Textarea label="Description" placeholder="Write something..." />
            <Textarea
              label="With error"
              placeholder="Write something..."
              error="Description is required"
            />
          </div>
        </section>

        {/* ── Card ── */}
        <section>
          <h2 className="text-h2 font-semibold text-text-primary mb-4">
            Card
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card variant="default">
              <CardHeader>
                <p className="text-h3 font-semibold">Default Card</p>
              </CardHeader>
              <CardContent>
                <p className="text-body-sm text-text-secondary">
                  This is a default card with border and subtle shadow.
                </p>
              </CardContent>
              <CardFooter>
                <p className="text-caption text-text-muted">Footer content</p>
              </CardFooter>
            </Card>
            <Card variant="elevated">
              <CardContent>
                <p className="text-h3 font-semibold">Elevated Card</p>
                <p className="text-body-sm text-text-secondary mt-1">
                  Stronger shadow for emphasis.
                </p>
              </CardContent>
            </Card>
            <Card variant="interactive">
              <CardContent>
                <p className="text-h3 font-semibold">Interactive Card</p>
                <p className="text-body-sm text-text-secondary mt-1">
                  Hover me for shadow transition.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ── Badge ── */}
        <section>
          <h2 className="text-h2 font-semibold text-text-primary mb-4">
            Badge
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="primary">Primary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="danger">Danger</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="neutral">Neutral</Badge>
          </div>
        </section>

        {/* ── Avatar ── */}
        <section>
          <h2 className="text-h2 font-semibold text-text-primary mb-4">
            Avatar
          </h2>
          <div className="flex flex-wrap items-center gap-4">
            <Avatar name="John Doe" size="sm" alt="John Doe" />
            <Avatar name="Jane Smith" size="md" alt="Jane Smith" />
            <Avatar name="Alex Johnson" size="lg" alt="Alex Johnson" />
            <Avatar
              name="Single"
              size="xl"
              alt="Single"
              src="https://invalid-url.example.com/img.jpg"
            />
            <Avatar size="md" alt="No name" />
          </div>
        </section>

        {/* ── IconButton ── */}
        <section>
          <h2 className="text-h2 font-semibold text-text-primary mb-4">
            IconButton
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <IconButton icon={<Plus />} aria-label="Add item" variant="primary" />
            <IconButton icon={<Edit />} aria-label="Edit item" />
            <IconButton
              icon={<Trash2 />}
              aria-label="Delete item"
              variant="danger"
            />
            <IconButton icon={<Search />} aria-label="Search" size="sm" />
            <IconButton
              icon={<Plus />}
              aria-label="Disabled"
              disabled
            />
          </div>
        </section>

        {/* ── Modal ── */}
        <section>
          <h2 className="text-h2 font-semibold text-text-primary mb-4">
            Modal
          </h2>
          <Button variant="secondary" onClick={() => setModalOpen(true)}>
            Open Modal
          </Button>
          <Modal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Example Modal"
            description="This is a reusable modal component."
          >
            <p className="text-body text-text-secondary">
              Press Escape or click the overlay to close. This modal supports
              scroll handling for small screens.
            </p>
            <div className="mt-4">
              <Button onClick={() => setModalOpen(false)}>Close</Button>
            </div>
          </Modal>
        </section>

        {/* ── ConfirmDialog ── */}
        <section>
          <h2 className="text-h2 font-semibold text-text-primary mb-4">
            ConfirmDialog
          </h2>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              onClick={() => setConfirmOpen(true)}
            >
              Confirm Action
            </Button>
            <Button
              variant="danger"
              onClick={() => setConfirmDangerOpen(true)}
            >
              Danger Confirm
            </Button>
          </div>
          <ConfirmDialog
            open={confirmOpen}
            onClose={() => setConfirmOpen(false)}
            onConfirm={handleConfirm}
            title="Confirm Action"
            description="Are you sure you want to proceed?"
            loading={loading}
          />
          <ConfirmDialog
            open={confirmDangerOpen}
            onClose={() => setConfirmDangerOpen(false)}
            onConfirm={handleConfirm}
            title="Delete Expense"
            description="Are you sure you want to delete this expense? This action cannot be undone."
            confirmLabel="Delete"
            loading={loading}
            danger
          />
        </section>

        {/* ── Tabs ── */}
        <section>
          <h2 className="text-h2 font-semibold text-text-primary mb-4">
            Tabs
          </h2>
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="settings" disabled>
                Settings
              </TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <Card>
                <CardContent>
                  <p className="text-body text-text-secondary">
                    Overview tab content. Keyboard navigable with arrow keys.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="details">
              <Card>
                <CardContent>
                  <p className="text-body text-text-secondary">
                    Details tab content.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        {/* ── Skeleton ── */}
        <section>
          <h2 className="text-h2 font-semibold text-text-primary mb-4">
            Skeleton
          </h2>
          <div className="max-w-md space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton variant="circle" width="40px" height="40px" />
              <div className="flex-1 space-y-2">
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" />
              </div>
            </div>
            <Skeleton variant="rect" width="100%" height="120px" />
          </div>
        </section>

        {/* ── EmptyState ── */}
        <section>
          <h2 className="text-h2 font-semibold text-text-primary mb-4">
            EmptyState
          </h2>
          <Card>
            <EmptyState
              icon={<Inbox />}
              title="No expenses yet"
              description="Create your first expense to start splitting costs with friends."
              action={
                <Button variant="primary" icon={<Plus />}>
                  Add Expense
                </Button>
              }
            />
          </Card>
        </section>

        {/* ── ErrorState ── */}
        <section>
          <h2 className="text-h2 font-semibold text-text-primary mb-4">
            ErrorState
          </h2>
          <Card>
            <ErrorState
              title="Failed to load expenses"
              description="We couldn't fetch your expenses. Please try again."
              onRetry={() => {}}
            />
          </Card>
        </section>
      </div>
    </main>
  );
}
