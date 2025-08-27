
import React from "react";
import { createRoot } from "react-dom/client";
import { Streamlit, StreamlitComponentBase, withStreamlitConnection } from "streamlit-component-lib";

type Data = { industry: string; niches: string[] }[];
type Selections = Record<string, string[]>;

// Minimal styles to keep things clean without Tailwind
const styles: Record<string, React.CSSProperties> = {
  app: { fontFamily: "Inter, system-ui, sans-serif", padding: 12 },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  h1: { fontSize: 18, fontWeight: 600, margin: 0 },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  card: { border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, background: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,.05)" },
  button: { padding: "6px 10px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer" },
  primary: { background: "#111827", color: "#fff", borderColor: "#111827" },
  badge: { fontSize: 12, padding: "2px 6px", borderRadius: 8, background: "#f3f4f6", color: "#374151" },
  row: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  checkboxRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }
};

class Picker extends StreamlitComponentBase {
  public state = {
    openIndustries: new Set<string>(),
    selections: {} as Selections,
  };

  componentDidMount(): void {
    // Initialize from default selections
    const defaultSel = (this.props.args["default_selected"] ?? {}) as Selections;
    this.setState({ selections: { ...defaultSel } }, () => this.push());
    Streamlit.setFrameHeight();
  }

  componentDidUpdate(): void {
    Streamlit.setFrameHeight();
  }

  private toggleIndustry(industry: string) {
    const open = new Set(this.state.openIndustries);
    if (open.has(industry)) open.delete(industry);
    else open.add(industry);
    this.setState({ openIndustries: open });
  }

  private setAll(industry: string, niches: string[], value: boolean) {
    const next = { ...this.state.selections };
    next[industry] = value ? [...niches] : [];
    this.setState({ selections: next }, () => this.push());
  }

  private toggleNiche(industry: string, niche: string) {
    const next = { ...this.state.selections };
    const arr = new Set(next[industry] ?? []);
    if (arr.has(niche)) arr.delete(niche); else arr.add(niche);
    next[industry] = Array.from(arr);
    this.setState({ selections: next }, () => this.push());
  }

  private push() {
    Streamlit.setComponentValue(this.state.selections);
  }

  render() {
    const data = (this.props.args["data"] ?? []) as Data;
    const { openIndustries, selections } = this.state;

    return (
      <div style={styles.app}>
        <div style={styles.header}>
          <h1 style={styles.h1}>Industry & Niche Picker</h1>
          <span style={styles.badge}>
            {Object.values(selections).reduce((acc, a) => acc + (a?.length || 0), 0)} selected
          </span>
        </div>

        <div style={styles.grid}>
          {/* Industries */}
          <section style={styles.card}>
            <div style={styles.row}>
              <strong>1) Choose industries</strong>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {data.map((row) => {
                const count = selections[row.industry]?.length || 0;
                const active = openIndustries.has(row.industry);
                return (
                  <button
                    key={row.industry}
                    onClick={() => this.toggleIndustry(row.industry)}
                    style={{ ...styles.button, textAlign: "left", padding: 12, borderRadius: 12, background: active ? "#111827" : "#fff", color: active ? "#fff" : "#111827", borderColor: active ? "#111827" : "#e5e7eb" }}
                  >
                    <div style={styles.row}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{row.industry}</div>
                        <div style={{ fontSize: 12, opacity: 0.7 }}>{row.niches.length} niches</div>
                      </div>
                      <div style={{ ...styles.badge, background: active ? "#fff" : "#f3f4f6", color: active ? "#111827" : "#374151" }}>{count}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Niches */}
          <section style={styles.card}>
            <div style={styles.row}>
              <strong>2) Select niches</strong>
            </div>
            {Array.from(openIndustries).length === 0 ? (
              <div style={{ fontSize: 14, color: "#4b5563" }}>Choose at least one industry on the left to see its niches here.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {Array.from(openIndustries).map((industry) => {
                  const row = data.find((d) => d.industry === industry);
                  if (!row) return null;
                  const all = row.niches;
                  const selected = new Set(selections[industry] ?? []);
                  const allChecked = selected.size === all.length;
                  const noneChecked = selected.size === 0;
                  return (
                    <div key={industry} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 }}>
                      <div style={styles.row}>
                        <div style={{ fontWeight: 600 }}>{industry}</div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => this.setAll(industry, all, true)} style={styles.button}>Select all</button>
                          <button onClick={() => this.setAll(industry, all, false)} style={styles.button}>Clear</button>
                          <button onClick={() => this.toggleIndustry(industry)} style={styles.button}>Remove industry</button>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#4b5563", marginBottom: 8 }}>
                        <span>Total: {all.length}</span>•<span>Selected: {selected.size}</span>•<span>Status: {allChecked ? "All" : noneChecked ? "None" : "Partial"}</span>
                      </div>
                      <div style={styles.checkboxRow}>
                        {all.map((niche) => {
                          const checked = selected.has(niche);
                          return (
                            <label key={`${industry}-${niche}`} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => this.toggleNiche(industry, niche)}
                              />
                              <span style={{ fontSize: 14 }}>{niche}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    );
  }
}

const Connected = withStreamlitConnection(Picker);
const root = createRoot(document.getElementById("root")!);
root.render(<Connected />);
