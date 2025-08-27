
import json, io, urllib.parse
from pathlib import Path
import pandas as pd
import streamlit as st
from industry_niche_component import industry_niche_picker

st.set_page_config(page_title="Industry & Niche Picker (Component)", page_icon="🧭", layout="wide")

# Load dataset (sheet names -> industries; cells -> niches), pre-generated as data.json
DATA_PATH = Path(__file__).parent / "data.json"
data = json.loads(DATA_PATH.read_text(encoding="utf-8"))

# Pull pre-selections from URL
qp = st.query_params
pre_sel_inds = qp.get("industries", [])
if isinstance(pre_sel_inds, str):
    pre_sel_inds = [pre_sel_inds]
pre_sel_niches = {}
for k, v in qp.items():
    if k.startswith("n_"):
        ind = urllib.parse.unquote(k[2:])
        vals = v if isinstance(v, list) else [v]
        pre_sel_niches[ind] = vals
if pre_sel_inds and not pre_sel_niches:
    # If only industries specified, create empty lists for them
    for ind in pre_sel_inds:
        pre_sel_niches.setdefault(ind, [])

st.title("Industry & Niche Picker (Streamlit Component)")
st.caption("React UI embedded as a Streamlit component. Search is disabled by request.")

# Render component (no search in the component UI)
selections = industry_niche_picker(data=data, default_selected=pre_sel_niches, key="picker")

# Summary & exports
rows = []
for ind, ns in selections.items():
    if ns:
        for n in ns:
            rows.append({"industry": ind, "niche": n})
    else:
        rows.append({"industry": ind, "niche": ""})
if rows:
    df = pd.DataFrame(rows)
    st.subheader("Selections summary")
    st.dataframe(df, use_container_width=True)

    json_bytes = io.BytesIO(json.dumps(selections, indent=2).encode("utf-8"))
    json_bytes.seek(0)
    st.download_button("Download JSON", data=json_bytes, file_name="selections.json", mime="application/json")

    csv_bytes = io.BytesIO()
    df.to_csv(csv_bytes, index=False)
    csv_bytes.seek(0)
    st.download_button("Download CSV", data=csv_bytes, file_name="selections.csv", mime="text/csv")

    qp_out = {"industries": [k for k in selections.keys()]}
    for ind, ns in selections.items():
        if ns:
            qp_out[f"n_{ind}"] = ns
    st.markdown("**Share this view** (encodes current selections):")
    st.code("?" + urllib.parse.urlencode(qp_out, doseq=True))

    if st.button("Update URL with selections"):
        st.query_params = qp_out
        st.success("URL updated — copy from your browser address bar.")
else:
    st.info("Pick at least one industry to begin.")
