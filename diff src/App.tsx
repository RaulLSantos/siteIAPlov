@@
-import Index from "./pages/Index.tsx";
+import Index from "./pages/Index.tsx";
+import AgendaCompleta from "./pages/AgendaCompleta";
@@
   <Router basename={basename}>
+      {/* Redirect from hash to route so /#agendacompleta works */}
+      {/* Minimal, safe: when user opens with #agendacompleta we navigate to /agendacompleta */}
+      {/* This component uses imperative navigation inside the Router */}
+      <Routes>
+        <Route
+          path="/_hashredirect"
+          element={<></>}
+        />
+      </Routes>
+      {/* Inline hash redirect */}
+      <HashRedirect />
       <Routes>
         <Route path="/" element={<Index />} />
+        <Route path="/agendacompleta" element={<AgendaCompleta />} />
         <Route path="*" element={<NotFound />} />
       </Routes>
     </Router>
@@
 export default App;
+
+// HashRedirect: detecta hash e navega para rota correspondente
+import { useEffect } from "react";
+import { useNavigate } from "react-router-dom";
+
+function HashRedirect() {
+  const navigate = useNavigate();
+  useEffect(() => {
+    const hash = window.location.hash || "";
+    if (hash === "#agendacompleta") {
+      // atualiza a URL sem reload
+      navigate("/agendacompleta", { replace: true });
+    }
+  }, [navigate]);
+  return null;
+}
