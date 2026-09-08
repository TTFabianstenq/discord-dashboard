import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Console } from "@/components/relay/console";
import { LoginScreen } from "@/components/relay/login";
import { useRelay } from "@/lib/discord/store";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const mode = useRelay((s) => s.mode);
  const hydrate = useRelay((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return mode ? <Console /> : <LoginScreen />;
}
