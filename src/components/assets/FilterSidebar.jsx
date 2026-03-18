import { CalendarDays, Search, X, RotateCcw } from "lucide-react";

function TagPill({ children, onRemove }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="flex w-full items-center justify-between rounded-md bg-black/10 px-3 py-2 text-sm"
    >
      <span className="truncate">{children}</span>
      <X className="ml-2 h-4 w-4 shrink-0" />
    </button>
  );
}

export default function FilterSidebar({ mobile = false, onClose }) {
  return (
    <div className="flex h-full flex-col bg-ui-surface">
      <div className="border-b border-black/10 p-4">
        <div className="flex items-center justify-between md:hidden">
          <h2 className="text-lg font-medium">Filters</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 hover:bg-black/5"
            aria-label="Close filters"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className={mobile ? "mt-3" : ""}>
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/60" />
            <input
              type="text"
              placeholder="Search"
              className="block w-full rounded-md bg-ui-surface px-3 pl-11 py-2 text-md border border-ui-border focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-3xl font-normal">Filters</h2>
          <button
            type="button"
            className="text-sm text-black/70 hover:text-black"
          >
            Clear All Filters
          </button>
        </div>

        <div className="space-y-5">
          <section>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs  tracking-wide text-black/70">
                Date Range
              </h3>
              <button
                type="button"
                className="inline-flex items-center gap-1 text-xs text-black/70 hover:text-black"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            </div>

            <div className="space-y-2">
              <div>
                <label
                  htmlFor="from"
                  className="block text-sm font-medium text-ui-muted"
                >
                  From
                </label>
                <div className="mt-1">
                  <input
                    id="from"
                    type="date"
                    name="from"
                    autoComplete="off"
                    className="block w-full rounded-md bg-ui-surface px-3 py-2 text-md border border-ui-border focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="to"
                  className="block text-sm font-medium text-ui-muted"
                >
                  To
                </label>
                <div className="mt-1">
                  <input
                    id="to"
                    type="date"
                    name="to"
                    autoComplete="off"
                    className="block w-full rounded-md bg-ui-surface px-3 py-2 text-md border border-ui-border focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
                  />
                </div>
              </div>
            </div>
          </section>

          <section>
            <label
              htmlFor="show-name"
              className="block text-sm font-medium text-ui-muted"
            >
              Show Name
            </label>
            <div className="mt-1">
              <input
                id="show-name"
                type="text"
                name="show-name"
                autoComplete="off"
                className="block w-full rounded-md bg-ui-surface px-3 py-2 text-md border border-ui-border focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
              />
            </div>
          </section>

          <section>
            <label
              htmlFor="company-name"
              className="block text-sm font-medium text-ui-muted"
            >
              Company Name
            </label>
            <div className="mt-1">
              <input
                id="company-name"
                type="text"
                name="company-name"
                autoComplete="off"
                className="block w-full rounded-md bg-ui-surface px-3 py-2 text-md border border-ui-border focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
              />
            </div>
          </section>

          <section>
            <label
              htmlFor="additional-tags"
              className="block text-sm font-medium text-ui-muted"
            >
              Additional Tags
            </label>
            <div className="mt-1">
              <input
                id="additional-tags"
                type="text"
                name="additional-tags"
                autoComplete="off"
                className="block w-full rounded-md bg-ui-surface px-3 py-2 text-md border border-ui-border focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
