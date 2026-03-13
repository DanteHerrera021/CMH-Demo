import { PageContainer } from "../components/layout/PageContainer";
import Button from "../components/ui/Button";

export default function Settings() {
  return (
    <PageContainer>
      <div className="mt-6 d-flex flex-col md:flex-row gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Settings</h1>
          <p className="text-slate-500 mb-6">
            Configure your media hub preferences.
          </p>
        </div>
        <div>
          <Button text="Save Settings" />
        </div>
      </div>

      <div></div>
    </PageContainer>
  );
}
