import { useCallback, useEffect, useState } from "react";
import { api, type Me } from "./api";
import { Admin } from "./Admin";
import { DailyTask, Mock, Now, Ready, Report, RouteView, Weekly } from "./daily";
import { CheckFlow, FinishLine, Goal, Result, Season, Welcome } from "./screens";
import { Mark, Screen } from "./ui";

function usePath() {
  const [path, setPath] = useState(location.pathname);
  useEffect(() => {
    const on = () => setPath(location.pathname);
    addEventListener("popstate", on);
    return () => removeEventListener("popstate", on);
  }, []);
  const go = useCallback((to: string) => {
    history.pushState(null, "", to);
    setPath(location.pathname);
    scrollTo(0, 0);
  }, []);
  return [path, go] as const;
}

export function App() {
  const [path, go] = usePath();
  const [me, setMe] = useState<Me | null>(null);
  const [failed, setFailed] = useState(false);
  const [editGoal, setEditGoal] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setMe(await api<Me>("/api/me"));
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, []);
  useEffect(() => { refresh(); }, [refresh]);

  if (path.startsWith("/admin")) return <Admin />;
  if (failed) return <Screen><p>Pillow couldn’t load. Check your connection and refresh the page.</p></Screen>;
  if (!me) return <Screen><div className="hero"><Mark size={40} /></div></Screen>;

  if (me.stage === "welcome") return <Welcome onDone={refresh} />;
  if (me.stage === "goal" || editGoal || path === "/goal") {
    return <Goal onDone={async () => { setEditGoal(false); await refresh(); go("/"); }} />;
  }
  if (me.stage === "finish-line") return <FinishLine me={me} onDone={refresh} onEdit={() => setEditGoal(true)} />;
  if (me.stage === "check") return <CheckFlow me={me} onDone={async () => { await refresh(); go("/result"); }} />;

  const props = { me, go, refresh };
  switch (path) {
    case "/result": return <Result me={me} go={go} />;
    case "/season": return <Season {...props} />;
    case "/task": return <DailyTask {...props} />;
    case "/weekly": return <Weekly {...props} />;
    case "/mock": return <Mock {...props} />;
    case "/route": return <RouteView me={me} go={go} />;
    case "/ready": return <Ready me={me} go={go} />;
    case "/report": return <Report {...props} />;
    default: return <Now me={me} go={go} />;
  }
}
