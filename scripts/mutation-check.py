#!/usr/bin/env python3
"""Hand-rolled mutation check for src/module-contract and src/dev-shell: each mutant must turn the vitest suite red.
Usage: python3 scripts/mutation-check.py   (restores every file afterwards). Mutant S14 is known-equivalent: antd falls back
to ConfigProvider.getPopupContainer, which FeedbackHost also sets."""
import subprocess, shutil, sys, re
import os
ROOT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..')+os.sep
M=[
 ('M1 tier boundary < to <= (672 becomes narrow)','src/module-contract/breakpoints.ts','if (width < bp.medium) return "narrow";','if (width <= bp.medium) return "narrow";'),
 ('M2 floor -> round','src/module-contract/containerStore.ts','const next = Math.floor(raw);','const next = Math.round(raw);'),
 ('M3 width 0 no longer ignored','src/module-contract/containerStore.ts','next <= 0 || ','next < 0 || '),
 ('M4 contain: layout paint -> paint','src/module-contract/moduleRootStyles.ts','contain: "layout paint",','contain: "paint",'),
 ('M5 ConfigProvider loses getPopupContainer','src/module-contract/ModuleRoot.tsx','<ConfigProvider theme={configTheme} getPopupContainer={getContainer}>','<ConfigProvider theme={configTheme}>'),
 ('M6 overlay fixed instead of absolute','src/module-contract/ModuleLoadingOverlay.tsx','position: absolute;','position: fixed;'),
 ('M7 reset scope :where(&) -> &','src/module-contract/resetCompat.ts','const SCOPE = ":where(&)";','const SCOPE = "&";'),
 ('M8 children before first measurement','src/module-contract/ModuleRoot.tsx','{ready ? (','{true ? ('),
 ('M9 useModuleFeedback never throws','src/module-contract/useModuleFeedback.ts','if (!api) throw new Error(OUTSIDE_ERROR);',''),
 ('M10 store notifies on unchanged width','src/module-contract/containerStore.ts',' || next === width) return;',') return;'),
 ('M11 outside-root warning not once','src/module-contract/hooks.ts','if (warnedOutside) return;','if (false) return;'),
 ('M12 fallback reads innerWidth','src/module-contract/containerStore.ts','accept(element.getBoundingClientRect().width || element.clientWidth);\n        };','accept(window.innerWidth);\n        };'),
 ('M13 Modal max-width rule dropped','src/module-contract/moduleRootStyles.ts','[".ant-modal", "max-width:calc(100cqw - 16px)"],',''),
 ('S1 ModuleRoot cleanup does not detach','src/module-contract/ModuleRoot.tsx','return () => store.detach();','return undefined;'),
 ('S2 attach() does not detach first','src/module-contract/containerStore.ts','      this.detach();\n      element = target;','      element = target;'),
 ('S3 ModuleRoot theme loses inherit:false','src/module-contract/ModuleRoot.tsx','{ ...theme, inherit: false } : undefined','{ ...theme } : undefined'),
 ('S3b feedback theme loses inherit:false','src/module-contract/FeedbackHost.tsx','theme={{ ...theme, inherit: false }}','theme={{ ...theme }}'),
 ('S4 className dropped','src/module-contract/ModuleRoot.tsx','      className={className}\n',''),
 ('S4b style dropped','src/module-contract/ModuleRoot.tsx','      style={style}\n',''),
 ('S5 cancelAnimationFrame dropped','src/module-contract/hooks.ts','if (frame && typeof cancelAnimationFrame === "function") cancelAnimationFrame(frame);',''),
 ('S6 store memo deps []','src/module-contract/ModuleRoot.tsx','[medium, wide, fallbackTier],','[],'),
 ('S7 simulator observer not disconnected','src/dev-shell/ShellSimulator.tsx','return () => observer.disconnect();','return undefined;'),
 ('S8 root overflow hidden -> visible','src/module-contract/moduleRootStyles.ts','overflow: "hidden",','overflow: "visible",'),
 ('S9 root position relative -> static','src/module-contract/moduleRootStyles.ts','position: "relative",','position: "static",'),
 ('S10 root min-width 0 dropped','src/module-contract/moduleRootStyles.ts','"min-width": "0",\n',''),
 ('S11 containerMaxWidth gap (max-width form)','src/module-contract/breakpoints.ts','(not (min-width: ${bp[tier]}px))','(max-width: ${bp[tier] - 0.02}px)'),
 ('S12 popup container getter not memoised','src/module-contract/hooks.ts','return useCallback(() => ctx?.getRootElement() ?? document.body, [ctx]);','return () => ctx?.getRootElement() ?? document.body;'),
 ('S13 reset dead selector back (html [type=button])','src/module-contract/resetCompat.ts',"\"button\", \"[type='button']\"","\"button\", \"html [type='button']\""),
 ('S14 feedback toasts not routed into the root','src/module-contract/FeedbackHost.tsx','const containerConfig = { getContainer };','const containerConfig = {};'),
 ('S15 compat colour pin dropped','src/module-contract/resetCompat.ts','  color: "#000",\n',''),
]
res=[]
for name,f,a,b in M:
    p=ROOT+f; orig=open(p).read()
    if a not in orig:
        res.append((name,'PATTERN NOT FOUND','')); continue
    open(p,'w').write(orig.replace(a,b,1))
    try:
        r=subprocess.run(['npx','vitest','run','--reporter=dot'],cwd=ROOT,capture_output=True,text=True,timeout=300)
        out=r.stdout+r.stderr
        m=re.search(r'Tests\s+(.*)',out)
        failed=re.findall(r'FAIL\s+(.*)',out)
        res.append((name,'KILLED' if r.returncode!=0 else 'SURVIVED',(m.group(1).strip() if m else '')+' | '+'; '.join(sorted(set(x.strip()[:90] for x in failed)))[:260]))
    finally:
        open(p,'w').write(orig)
for r in res: print(r[0],'->',r[1],'|',r[2])
