import { PageContainer } from "../components/layout/PageContainer";
import Button from "../components/ui/Button";

export default function Settings() {
  return (
    <PageContainer>
      <div className="mt-6 flex flex-col md:flex-row md:justify-between md:align-center md:gap-4 gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Settings</h1>
          <p className="text-slate-500">
            Configure default metadata and tags for your media uploads.
          </p>
        </div>
        <div className="">
          <Button
            text="Save Settings"
            rounded="sm"
            className="bg-brand-primary text-white w-100 md:w-auto"
          />
        </div>
      </div>

      <div>
        <div className="border-y-2 border-ui-border py-4 grid md:grid-cols-[1fr_2fr] md:gap-4 gap-1 items-center">
          <label htmlFor="show-name">Show Name</label>
          <input
            id="show-name"
            type="text"
            name="show-name"
            autoComplete="off"
            className="w-full rounded-md bg-ui-surface px-3 py-2 text-md border border-ui-border focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
          />
        </div>
        <div className="py-4 grid md:grid-cols-[1fr_2fr] md:gap-4 gap-1 items-center">
          <label htmlFor="date-override">Date Override</label>
          <input
            id="date-override"
            type="date"
            name="date-override"
            autoComplete="off"
            className="w-full rounded-md bg-ui-surface px-3 py-2 text-md border border-ui-border focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
          />
        </div>
        <div className="border-y-2 border-ui-border py-4 grid md:grid-cols-[1fr_2fr] md:gap-4 gap-1 items-center">
          <label htmlFor="additional-tags">Additional Tags</label>
          <input
            id="additional-tags"
            type="text"
            name="additional-tags"
            autoComplete="off"
            className="w-full rounded-md bg-ui-surface px-3 py-2 text-md border border-ui-border focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
          />
        </div>
      </div>
    </PageContainer>
  );
}
