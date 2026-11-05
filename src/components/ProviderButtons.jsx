import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import GoogleIcon from "@/components/GoogleIcon";

const MS = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden><path fill="#f25022" d="M2 2h9.5v9.5H2z" /><path fill="#7fba00" d="M12.5 2H22v9.5h-9.5z" /><path fill="#00a4ef" d="M2 12.5h9.5V22H2z" /><path fill="#ffb900" d="M12.5 12.5H22V22h-9.5z" /></svg>
);
const FB = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden><path fill="#1877f2" d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12z" /></svg>
);
const APPLE = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden><path fill="#000" d="M16.4 12.6c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.7 1.3 10.2.8 1.2 1.8 2.6 3.1 2.5 1.3-.1 1.7-.8 3.2-.8s1.9.8 3.2.8c1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8 0 0-2.6-1-2.6-4.2zM13.9 5c.7-.8 1.2-2 1-3.1-1 0-2.2.7-2.9 1.5-.6.7-1.2 1.9-1 3 1.1.1 2.2-.6 2.9-1.4z" /></svg>
);

const PROVIDERS = [
  { id: "google", label: "Google", Icon: () => <GoogleIcon className="w-5 h-5" /> },
  { id: "microsoft", label: "Microsoft", Icon: MS },
  { id: "facebook", label: "Facebook", Icon: FB },
  { id: "apple", label: "Apple", Icon: APPLE },
];

export default function ProviderButtons({ returnTo }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 mb-6">
      {PROVIDERS.map(({ id, label, Icon }) => (
        <Button key={id} type="button" variant="outline" className="h-11 text-sm font-medium gap-2" onClick={() => base44.auth.loginWithProvider(id, returnTo)}>
          <Icon /> {label}
        </Button>
      ))}
    </div>
  );
}