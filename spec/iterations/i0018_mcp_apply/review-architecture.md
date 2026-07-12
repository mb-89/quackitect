# i18 architecture review — the diagram to approve

The five NEW blocks (green, planned/unrealized until M6 fills them) and the three
existing blocks with BEHAVIOR CHANGES (amber). The build adheres to this — it may
fill these blocks and invent no others.

```mermaid
flowchart TD
  subgraph rim["rim — transport & console faces"]
    mcp["go-mcp-server<br/>hand-rolled stdio MCP<br/>transport + tool dispatch"]:::new
    sess["go-mcp-session<br/>per-session attest state<br/>+ the ledger choke point"]:::new
    ask["go-ask-loop<br/>+ await-console-exit"]:::chg
  end
  subgraph rimgraph["rim--graph — file & render transforms"]
    schemas["go-field-schemas<br/>per-field load / merge / validate"]:::new
    tester["go-schema-tester<br/>validate the schema set itself"]:::new
    informed["go-informed-by-edges<br/>decision to element<br/>links + render"]:::new
    dtable["go-decisions-table"]:::keep
    lintc["lint command<br/>+ lint-exit-honest (0=advisory,1=finding,2=refused)"]:::chg
  end
  subgraph services["services"]
    bless["go-bless<br/>- render-on-bless (report-debounce)"]:::chg
  end

  client([MCP client]) -->|stdio| mcp
  mcp --> sess
  sess -->|attested| ledger([ledger tools])
  schemas --> tester
  informed -.->|links| dtable
  adr([architecture ADRs<br/>kind: architecture]) -.->|informed-by<br/>built this iter| informed

  classDef new fill:#c8e6c9,stroke:#2e7d32,color:#1b1b1b;
  classDef chg fill:#ffe0b2,stroke:#e65100,color:#1b1b1b;
  classDef keep fill:#eeeeee,stroke:#9e9e9e,color:#1b1b1b;
```

**Green = new blocks** · **amber = existing blocks with a behavior change** · grey = existing, unchanged (shown for context).

The onion (full engine model, all bands) lives in [model-engine-layers.md](../../models/model-engine-layers.md); this is the focused i18 delta for review.
