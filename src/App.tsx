import { useEffect, useMemo, useState } from 'react';

const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path}`;

type Resource = {
  id: string;
  phase: number;
  label: string;
  title: string;
  description: string;
  status: 'ready' | 'planned' | 'pending';
  statusLabel: string;
  items: string[];
  note?: string;
  audiences?: Exclude<Stakeholder, 'general'>[];
};

type Stakeholder = 'general' | 'researcher' | 'co-creator';

type StakeholderAction = {
  eyebrow: string;
  title: string;
  description: string;
  actions: string[];
  benefit: string;
};

const stakeholders: { id: Stakeholder; label: string; description: string; monogram: string }[] = [
  { id: 'general', label: 'General overview', description: 'See the complete process', monogram: 'ALL' },
  { id: 'researcher', label: 'Security researcher', description: 'Propose, mobilize, apply and deliver', monogram: 'SR' },
  { id: 'co-creator', label: 'RFP co-creator', description: 'Define, co-fund, select and learn', monogram: 'RFP' },
];

const stakeholderActions: Record<Exclude<Stakeholder, 'general'>, StakeholderAction[]> = {
  researcher: [
    {
      eyebrow: 'Your role now',
      title: 'Bring forward a focused security solution',
      description: 'Submit a grant proposal with a clear problem, credible evidence and an adoption path. Only a small number of grants are expected to advance, and an expert panel may decide the need should become an open RFP instead.',
      actions: ['Describe the solution and security need', 'Show evidence, reach and delivery credibility', 'Prepare for a possible grant-to-RFP decision'],
      benefit: 'A route to fund valuable security work — or turn it into a larger, competitive RFP.',
    },
    {
      eyebrow: 'Build the funding signal',
      title: 'Help make the work fundable',
      description: 'If your proposal remains a grant, work on attracting support for it. If the need becomes an RFP you intend to apply to, campaign for that RFP to reach its funding threshold.',
      actions: ['Find aligned supporters and prospective donors', 'Explain why the work matters now', 'Build visible demand without assuming selection'],
      benefit: 'A better chance that valuable work reaches the funded application stage.',
    },
    {
      eyebrow: 'Compete on the solution',
      title: 'Apply to the funded RFP',
      description: 'Once an RFP opens, submit a delivery proposal that directly answers the need and makes technical quality, milestones, cost and adoption concrete.',
      actions: ['Respond to the stated outcome', 'Name the accountable team and approach', 'Define milestones, evidence, budget and adoption'],
      benefit: 'A fair route to compete for funded security work on the strength of your proposal.',
    },
    {
      eyebrow: 'Deliver if selected',
      title: 'Execute, prove progress and support adoption',
      description: 'The selected researcher or team carries out the work, submits milestone evidence and stays accountable through implementation and adoption.',
      actions: ['Deliver against the agreed milestones', 'Provide evidence for verification', 'Support adoption and report observed outcomes'],
      benefit: 'Milestone-based funding, demonstrated impact and a credible record of delivery.',
    },
  ],
  'co-creator': [
    {
      eyebrow: 'Your role now',
      title: 'Bring us the security need',
      description: 'Institutions, high-TVL protocols, the Ethereum Foundation, EthSystems, EthLabs and other ecosystem organizations should engage during mapping — before the RFP is written — so the initiative reflects a real, material need.',
      actions: ['Name the problem and who is exposed', 'Bring evidence, urgency and subject-matter context', 'Help define the outcome an RFP should achieve'],
      benefit: 'Shape a shared solution around your real-world need and multiply your contribution with ecosystem and DAO funding.',
    },
    {
      eyebrow: 'Turn need into commitment',
      title: 'Prepare to co-fund the RFP',
      description: 'Help the initiative clear the ecosystem-funding threshold through a pledge, a direct contribution or aligned fundraising support.',
      actions: ['Identify your likely contribution route', 'Prepare the internal decision and budget', 'Bring aligned organizations into the funding coalition'],
      benefit: 'Leverage your contribution with other ecosystem funders and potential DAO allocation.',
    },
    {
      eyebrow: 'Bring domain judgement',
      title: 'Help select the right delivery team',
      description: 'Nominate a designated subject-matter expert to help assess applicants and identify the team best equipped to solve the RFP you helped define.',
      actions: ['Nominate the appropriate expert', 'Assess technical and operational fit', 'Help determine whether any proposal clears the quality bar'],
      benefit: 'A meaningful voice in choosing a team capable of addressing your security need.',
    },
    {
      eyebrow: 'Close the learning loop',
      title: 'See whether the work creates impact',
      description: 'Follow milestone evidence, support real-world adoption where relevant and examine whether the funded work addressed the original need.',
      actions: ['Review progress and milestone evidence', 'Enable or observe adoption where possible', 'Share outcome evidence and lessons'],
      benefit: 'Visibility into delivery, adoption and the security value created by your contribution.',
    },
  ],
};

const phaseNav = [
  { number: '01', label: 'Map', title: 'Map the right problems' },
  { number: '02', label: 'Co-fund', title: 'Secure co-funding' },
  { number: '03', label: 'Select', title: 'Run the RFP and select a team' },
  { number: '04', label: 'Deliver', title: 'Implement and measure adoption' },
];

const resources: Resource[] = [
  {
    id: 'problem-prompts', phase: 1, label: 'Checklist', title: 'Problem-mapping prompts',
    description: 'Questions for turning a broad security concern into a defined initiative.',
    status: 'ready', statusLabel: 'Use now',
    audiences: ['researcher', 'co-creator'],
    items: ['What is the security problem, and who is exposed?', 'How many protocols or users could benefit?', 'What value is at risk or could be protected?', 'What evidence shows that the problem is real?', 'What would adoption look like in practice?'],
  },
  {
    id: 'route-guide', phase: 1, label: 'Decision guide', title: 'Grant or RFP?',
    description: 'A working distinction for routing an initiative idea.',
    status: 'ready', statusLabel: 'Working guide',
    audiences: ['researcher', 'co-creator'],
    items: ['Problem first: define a need and invite teams to solve it through an RFP.', 'Solution first: assess an existing solution as a candidate grant.', 'Both routes still need evidence, a budget, delivery confidence and an adoption path.'],
    note: 'The final grant-versus-RFP routing rule still needs confirmation.',
  },
  {
    id: 'qualification-framework', phase: 1, label: 'Framework', title: 'Qualification framework',
    description: 'A consistent scoring method and reviewer group for the first gate.',
    status: 'planned', statusLabel: 'Guidance needed',
    audiences: ['researcher', 'co-creator'],
    items: ['Expected impact and reach', 'Team credibility and delivery confidence', 'Commercial fit and co-funding', 'Adoption capacity and supporting evidence'],
    note: 'The categories are known; weights, thresholds and decision rights are not yet final.',
  },
  {
    id: 'funding-thresholds', phase: 2, label: 'Working parameters', title: 'Eligibility and allocation parameters',
    description: 'The current examples that will shape eligibility and DAO allocation once curators lock them.',
    status: 'planned', statusLabel: 'Decision pending',
    audiences: ['researcher', 'co-creator'],
    items: ['Working eligibility floor: an initiative first raises about 25% of its ask.', 'Working cap: no initiative receives more than about 20% of TheDAO pool.', 'Badge holders rank initiatives; each participating ballot directs an equal slice of the pool.', 'An eligible ballot may need to rank at least four initiatives.', 'How donations during the voting window influence allocation remains open.'],
    note: 'The draft explicitly treats 25% and 20% as examples. The algorithm and floor are planned for September; pool size, caps and the donation split are planned for October.',
  },
  {
    id: 'vote-mechanics', phase: 2, label: 'Vote explainer', title: 'Participatory budgeting model',
    description: 'How ranked preferences are expected to direct TheDAO pool at a high level.',
    status: 'planned', statusLabel: 'Design in progress',
    audiences: ['researcher', 'co-creator'],
    items: ['Every participating ballot directs an equal slice of the available pool.', 'A ballot fills its first-ranked initiative up to its remaining need or cap.', 'Any unused part of that slice flows down the ballot in ranked order.', 'The voter experience resembles ranked choice, but the allocation model comes from participatory budgeting research.'],
    note: 'The exact algorithm, operator and budget are not yet approved. The working direction is a fit-for-purpose build with Blossom Labs, subject to curator confirmation.',
  },
  {
    id: 'institution-brief', phase: 2, label: 'Institution pack', title: 'Co-funding brief for institutions',
    description: 'What co-funders get, what they commit to and when a pledge becomes payable.',
    status: 'planned', statusLabel: 'Planned document',
    audiences: ['co-creator'],
    items: ['Round purpose and eligible initiatives', 'Pledge and direct-donation routes', 'Recognition, reporting and information rights', 'Payment timing, conditions and contacts'],
    note: 'This is one of the next documents to produce from the process map.',
  },
  {
    id: 'donor-terms', phase: 2, label: 'Legal', title: 'Pledge and donor terms',
    description: 'The formal terms behind commitments, claims and unfilled-round funds.',
    status: 'pending', statusLabel: 'Pending legal',
    audiences: ['co-creator'],
    items: ['Sponsor pledge agreement and payment timing', 'Donation terms of service', 'Vendor agreements and the Giveth addendum', 'Written sanctions and compliance procedure', 'Licensing and fundraising-authority cleanup', 'Discretionary treatment of funds attached to unfunded initiatives'],
    note: 'The dApp may be announced before these documents are final, but the donate button remains disabled until legal clearance. This panel is informational, not legal terms.',
  },
  {
    id: 'funded-routes', phase: 3, label: 'Process guide', title: 'What happens once funded',
    description: 'The distinct opening window for funded RFPs and grants.',
    status: 'ready', statusLabel: 'Working process',
    audiences: ['researcher', 'co-creator'],
    items: ['Funded RFP: a 30-day open proposal window begins.', 'Funded grant: a 15-day challenge period allows a better counter-proposal for a similar scope and budget.', 'Pledges are collected during the same window; sponsor funds move only after the initiative is fully funded.', 'The selected team locks milestones and delivery dates during the window.'],
    note: 'This operating process is still a draft and is expected to receive an external grants-management review before it is final.',
  },
  {
    id: 'proposal-checklist', phase: 3, label: 'Applicant guide', title: 'Proposal readiness checklist',
    description: 'A practical pre-flight check before an RFP submission is sent.',
    status: 'ready', statusLabel: 'Working checklist',
    audiences: ['researcher'],
    items: ['Directly address the funded RFP and intended outcome.', 'Show relevant technical and delivery experience.', 'Define milestones, evidence and the proposed budget.', 'Explain adoption, dependencies and material risks.', 'Name the delivery team and accountable lead.'],
  },
  {
    id: 'application-template', phase: 3, label: 'Template', title: 'RFP application template',
    description: 'The standard structure teams will use to submit a proposal.',
    status: 'planned', statusLabel: 'Planned template',
    audiences: ['researcher'],
    items: ['Team and credentials', 'Technical approach', 'Milestones and evidence', 'Budget and commercial terms', 'Adoption plan and risks'],
    note: 'The final fields and submission route are still being defined.',
  },
  {
    id: 'review-rubric', phase: 3, label: 'Reviewer guide', title: 'Review and selection rubric',
    description: 'A transparent basis for DAO and expert assessment.',
    status: 'planned', statusLabel: 'Guidance needed',
    audiences: ['co-creator'],
    items: ['Technical merit', 'Feasibility and team fit', 'Cost and value for money', 'Adoption likelihood', 'Security, operational and conflict risks'],
    note: 'Reviewer composition, conflicts and final decision rights remain open.',
  },
  {
    id: 'delivery-operations', phase: 4, label: 'Operating model', title: 'Delivery and fund-flow controls',
    description: 'How funded initiatives are expected to be administered, monitored and recovered if necessary.',
    status: 'ready', statusLabel: 'Working process',
    audiences: ['researcher', 'co-creator'],
    items: ['One 3-of-5 mainnet multisig per initiative; no smart contracts for fund flows.', 'Teams may take half of milestone one up front when runway is needed.', 'Weekly status collection and a dedicated group chat support milestone tracking.', 'A missed deadline triggers a warning and a 21-day recovery period.', 'If a project fails, unspent funds can be reclaimed for discretionary return or other Ethereum security work.'],
    note: 'The draft estimates operational support at $1,000 per grant and $2,500 per RFP, including paid proposal review for RFP selection.',
  },
  {
    id: 'milestone-evidence', phase: 4, label: 'Delivery guide', title: 'Milestone evidence checklist',
    description: 'What to define before work starts and verify before funds are released.',
    status: 'ready', statusLabel: 'Working checklist',
    audiences: ['researcher', 'co-creator'],
    items: ['Observable deliverable and acceptance criteria', 'Evidence owner and review method', 'Target date and dependencies', 'Amount unlocked by acceptance', 'Revision, extension or failure path'],
  },
  {
    id: 'adoption-guide', phase: 4, label: 'Impact guide', title: 'Adoption measurement guide',
    description: 'How to move beyond output delivery and examine real-world use.',
    status: 'planned', statusLabel: 'Guidance needed',
    audiences: ['researcher', 'co-creator'],
    items: ['Who adopted the work and for what use?', 'What changed after adoption?', 'What evidence supports the outcome?', 'What remains uncertain or attributable to others?', 'When should follow-up measurement happen?'],
    note: 'Project-specific metrics and the reporting horizon still need to be set.',
  },
  {
    id: 'report-template', phase: 4, label: 'Template', title: 'Final reporting template',
    description: 'A common structure for delivery evidence, adoption and lessons learned.',
    status: 'planned', statusLabel: 'Planned template',
    audiences: ['researcher'],
    items: ['Milestones and evidence', 'Budget and disbursement status', 'Adoption and observed outcomes', 'Attribution and limitations', 'Follow-on actions and reusable learning'],
  },
];

function ResourceCard({ resource, stakeholder, onOpen }: { resource: Resource; stakeholder: Stakeholder; onOpen: (resource: Resource) => void }) {
  const isRelevant = stakeholder !== 'general' && resource.audiences?.includes(stakeholder);
  const isSecondary = stakeholder !== 'general' && !isRelevant;
  return (
    <button className={`resource-card${isRelevant ? ' is-relevant' : ''}${isSecondary ? ' is-secondary' : ''}`} onClick={() => onOpen(resource)} type="button">
      <span className={`resource-status ${resource.status}`}>{resource.statusLabel}</span>
      {isRelevant && <span className="resource-match">For your path</span>}
      <span className="resource-label">{resource.label}</span>
      <strong>{resource.title}</strong>
      <span className="resource-description">{resource.description}</span>
      <span className="resource-open">Open <span aria-hidden="true">→</span></span>
    </button>
  );
}

function ResourceShelf({ phase, stakeholder, onOpen }: { phase: number; stakeholder: Stakeholder; onOpen: (resource: Resource) => void }) {
  const phaseResources = resources.filter((resource) => resource.phase === phase);
  return (
    <section className="resource-shelf" aria-labelledby={`phase-${phase}-resources`}>
      <div className="shelf-heading">
        <p className="resource-kicker">{stakeholder === 'general' ? 'Useful at this moment' : 'Tools for this phase'}</p>
        <h3 id={`phase-${phase}-resources`}>Guidance and templates</h3>
      </div>
      <div className="resource-grid">
        {phaseResources.map((resource) => <ResourceCard key={resource.id} resource={resource} stakeholder={stakeholder} onOpen={onOpen} />)}
      </div>
    </section>
  );
}

function StakeholderPathCard({ stakeholder, phase }: { stakeholder: Exclude<Stakeholder, 'general'>; phase: number }) {
  const action = stakeholderActions[stakeholder][phase - 1];
  return (
    <section className={`stakeholder-path-card ${stakeholder}`} key={`${stakeholder}-${phase}`} aria-live="polite">
      <span className="path-step-marker">{String(phase).padStart(2, '0')} / 04</span>
      <div className="stakeholder-path-intro">
        <span className="path-role">{stakeholder === 'researcher' ? 'Security researcher' : 'RFP co-creator'}</span>
        <p className="eyebrow">{action.eyebrow}</p>
        <h3>{action.title}</h3>
        <p>{action.description}</p>
      </div>
      <ol>{action.actions.map((item) => <li key={item}>{item}</li>)}</ol>
      <aside><span>What&apos;s in it for you</span><strong>{action.benefit}</strong></aside>
    </section>
  );
}

export default function Home() {
  const [activePhase, setActivePhase] = useState(1);
  const [stakeholder, setStakeholder] = useState<Stakeholder>('general');
  const [openResource, setOpenResource] = useState<Resource | null>(null);
  const progress = useMemo(() => `${((activePhase - 1) / 3) * 100}%`, [activePhase]);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-phase]'));
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActivePhase(Number((visible.target as HTMLElement).dataset.phase));
    }, { rootMargin: '-28% 0px -50% 0px', threshold: [0, .2, .5] });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!openResource) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpenResource(null); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [openResource]);

  return (
    <main className={`stakeholder-${stakeholder}`}>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="TheDAO Security Fund home">
          <img src={assetUrl('thedao-mark.svg')} alt="" />
          <span>TheDAO <strong>Security Fund</strong></span>
        </a>
      </header>

      <section className="hero" id="top">
        <p className="eyebrow">Round 2 funding process</p>
        <h1>From a security problem<br />to measurable adoption.</h1>
        <p className="hero-copy">
          Follow this interactive timeline for Round 2. As you move through the
          process you'll find the relevant information at every stage.
        </p>
        <section className="stakeholder-picker" aria-labelledby="stakeholder-title">
          <div className="picker-heading">
            <p className="eyebrow" id="stakeholder-title">Choose your path</p>
          </div>
          <div className="stakeholder-options" role="group" aria-label="Choose a stakeholder view">
            {stakeholders.map((option) => (
              <button
                aria-pressed={stakeholder === option.id}
                className={stakeholder === option.id ? `stakeholder-option ${option.id} active` : `stakeholder-option ${option.id}`}
                key={option.id}
                onClick={() => setStakeholder(option.id)}
                type="button"
              >
                <span className="stakeholder-monogram">{option.monogram}</span>
                <span><strong>{option.label}</strong><small>{option.description}</small></span>
                <i aria-hidden="true">✓</i>
              </button>
            ))}
          </div>
        </section>
        <div className="hero-actions">
          <a className="primary-button" href="#phase-1">Start the journey <span>↓</span></a>
        </div>
      </section>

      <section className="journey" aria-label="Round 2 process timeline">
        <nav className="phase-nav" aria-label="Timeline phases">
          <div className="rail" aria-hidden="true"><span style={{ height: progress }} /></div>
          {phaseNav.map((phase, index) => (
            <a
              aria-current={activePhase === index + 1 ? 'step' : undefined}
              className={activePhase === index + 1 ? 'phase-nav-item active' : 'phase-nav-item'}
              href={`#phase-${index + 1}`}
              key={phase.number}
              title={phase.title}
            >
              <span className="phase-dot">{phase.number}</span>
              <span>{phase.label}</span>
            </a>
          ))}
        </nav>

        <div className="phase-stack">
          <article className="phase" data-phase="1" id="phase-1">
            <div className="phase-number">01</div>
            <div className="phase-heading">
              <p className="eyebrow">Ideation</p>
              <h2>Map the right problems</h2>
              <p>Surface high-value security needs and turn them into initiatives that can be assessed and funded.</p>
            </div>

            {stakeholder !== 'general' && <StakeholderPathCard stakeholder={stakeholder} phase={1} />}

            <div className={stakeholder === 'general' ? 'general-process' : 'general-process is-muted'}>
              <div className="path-grid">
                <section className="path-card">
                  <span className="card-tag blue">Private signal track</span>
                  <h3>Listen to the ecosystem</h3>
                  <p>TheDAO is working directly with protocols, Ethereum-aligned organizations, institutions and security experts.</p>
                  <ul><li>Major protocols and ecosystem players</li><li>Companies and public institutions</li><li>Security researchers and experts</li></ul>
                </section>
                <section className="path-card">
                  <span className="card-tag red">Public submission track</span>
                  <h3>Invite initiative ideas</h3>
                  <div className="route-row"><strong>Problem first</strong><span>Candidate RFP</span></div>
                  <div className="route-row"><strong>Solution first</strong><span>Candidate grant</span></div>
                </section>
              </div>

              <section className="gate-card">
                <div><span className="card-tag blue">Qualification gate - draft</span><h3>Advance, revise or stop</h3></div>
                <div className="gate-grid"><span>Expected impact</span><span>Protocols affected</span><span>Value at risk</span><span>Team credibility</span><span>Co-funding</span><span>Adoption capacity</span></div>
                <p>The scoring method, reviewer group and minimum evidence threshold still need to be defined.</p>
              </section>

              <div className="phase-output"><span>Phase output</span><strong>A defined initiative ready for co-funding</strong></div>
            </div>
            <ResourceShelf phase={1} stakeholder={stakeholder} onOpen={setOpenResource} />
          </article>

          <article className="phase" data-phase="2" id="phase-2">
            <div className="phase-number">02</div>
            <div className="phase-heading">
              <p className="eyebrow">Capital formation</p>
              <h2>Secure co-funding</h2>
              <p>Combine ecosystem support, direct capital and DAO allocation, then determine which initiatives can advance.</p>
            </div>

            {stakeholder !== 'general' && <StakeholderPathCard stakeholder={stakeholder} phase={2} />}

            <div className={stakeholder === 'general' ? 'general-process' : 'general-process is-muted'}>
              <div className="funding-flow">
              <div className="funding-channels">
                <div><span>01</span><section><strong>Pledges</strong><p>Conditional commitments tied to agreed funding conditions.</p></section></div>
                <div><span>02</span><section><strong>Direct donations</strong><p>Capital contributed to the round or a defined initiative.</p></section></div>
                <div><span>03</span><section><strong>DAO pool</strong><p>Badge holders rank eligible initiatives through participatory budgeting.</p></section></div>
              </div>
              <div className="funding-decision">
                <span className="card-tag red">Funding check</span>
                <h3>Have the round&apos;s conditions been met?</h3>
                <div className="decision-outcomes">
                  <div className="advance"><small>Funded</small><strong>Advance to selection</strong><p>A funded RFP opens for team applications.</p></div>
                  <div className="stop"><small>Not funded by Jan 31</small><strong>Close and wind down</strong><p>TheDAO may return attached donations at its discretion; no refund is promised.</p></div>
                </div>
              </div>
              </div>
              <aside className="vote-model">
                <div><span className="card-tag blue">Nov 15 → ~Dec 3</span><h3>Rank preferences. Allocate proportionally.</h3></div>
                <p>Each participating ballot directs an equal slice of the pool. It fills the first-ranked initiative up to its remaining need or cap, then flows down the ranking. Exact parameters and the influence of in-window donations remain open.</p>
              </aside>
            </div>

            <ResourceShelf phase={2} stakeholder={stakeholder} onOpen={setOpenResource} />
          </article>

          <article className="phase" data-phase="3" id="phase-3">
            <div className="phase-number">03</div>
            <div className="phase-heading">
              <p className="eyebrow">RFP process</p>
              <h2>Run the RFP and select a team</h2>
              <p>Open applications, assess submissions and choose the team best placed to deliver the required outcome.</p>
            </div>

            {stakeholder !== 'general' && <StakeholderPathCard stakeholder={stakeholder} phase={3} />}

            <div className={stakeholder === 'general' ? 'general-process' : 'general-process is-muted'}>
              <div className="funded-route-grid">
                <article><span className="card-tag red">Funded RFP</span><strong>30-day open proposal window</strong><p>Qualified teams compete to deliver the funded outcome.</p></article>
                <article><span className="card-tag blue">Funded grant</span><strong>15-day challenge period</strong><p>A team is known, but a counter-proposal may offer a better outcome for a similar scope and budget.</p></article>
              </div>
              <div className="selection-flow">
                <div className="selection-step"><span>01</span><small>Open</small><h3>Invite applications</h3><p>Publish the funded RFP and invite qualified teams to submit.</p></div>
                <div className="selection-arrow" aria-hidden="true">→</div>
                <div className="selection-step featured"><span>02</span><small>Review</small><h3>Assess submissions</h3><p>Badge holders and relevant subject-matter experts review proposals. The working budget is up to $1,500 per RFP selection.</p></div>
                <div className="selection-arrow" aria-hidden="true">→</div>
                <div className="selection-step"><span>03</span><small>Select</small><h3>Choose a team</h3><p>Name the delivery team that best meets the RFP&apos;s requirements.</p></div>
              </div>

              <aside className="safety-valve"><span>Quality safety valve</span><p>If experts judge that no submission clears the required merit threshold, the RFP can be reopened or the project stopped.</p></aside>
            </div>
            <ResourceShelf phase={3} stakeholder={stakeholder} onOpen={setOpenResource} />
          </article>

          <article className="phase" data-phase="4" id="phase-4">
            <div className="phase-number">04</div>
            <div className="phase-heading">
              <p className="eyebrow">Implementation</p>
              <h2>Release funds against progress</h2>
              <p>Tie disbursement to verified milestones, then keep adoption and real-world outcomes in scope.</p>
            </div>

            {stakeholder !== 'general' && <StakeholderPathCard stakeholder={stakeholder} phase={4} />}

            <div className={stakeholder === 'general' ? 'general-process' : 'general-process is-muted'}>
              <div className="delivery-flow">
                {[
                  ['Start', 'Agreement and milestone plan', 'Define deliverables, evidence and acceptance points.'],
                  ['Build', 'Work against milestones', 'The selected team delivers in agreed increments.'],
                  ['Verify', 'Review evidence', 'Confirm each milestone before capital is released.'],
                  ['Pay', 'Disburse', 'Release funds against accepted milestones.'],
                  ['Adopt', 'Measure use and impact', 'Track adoption, outcomes and remaining uncertainty.'],
                ].map(([label, title, text], index) => (
                  <div className={index === 2 || index === 4 ? 'delivery-step featured' : 'delivery-step'} key={label}>
                    <small>{label}</small><h3>{title}</h3><p>{text}</p><span>{index === 4 ? 'Evidence' : index === 3 ? 'Payment' : index === 2 ? 'Accept / revise' : index === 1 ? 'Work product' : 'Signed plan'}</span>
                  </div>
                ))}
              </div>

              <aside className="adoption-rule"><span>Working adoption rule</span><p>The final milestone is the largest and depends on adoption and real impact. For initiatives under $300,000, the adoption milestone is one-third to one-half of the total budget; above $300,000, at least $100,000.</p></aside>
              <div className="delivery-principles">
                <article><span>Fund flow</span><strong>One 3-of-5 mainnet multisig per initiative</strong><p>No smart contracts for fund flows; payouts remain transparent onchain.</p></article>
                <article><span>Runway</span><strong>Half of milestone one may be advanced</strong><p>The remainder lands after milestone-one acceptance.</p></article>
                <article><span>Recovery</span><strong>Warning plus 21 days</strong><p>Missed deadlines get hands-on recovery before unspent funds may be reclaimed.</p></article>
              </div>
            </div>
            <ResourceShelf phase={4} stakeholder={stakeholder} onOpen={setOpenResource} />

            <section className="closing-card">
              <p className="eyebrow">The complete loop</p>
              <h2>Fund the work.<br />Verify the progress.<br />Learn from adoption.</h2>
              <div><a href="#top">Back to the start ↑</a></div>
            </section>
          </article>
        </div>
      </section>

      <footer><span>TheDAO Security Fund</span><span>Round 2 working process - v0.2</span></footer>

      {openResource && (
        <div className="drawer-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpenResource(null); }}>
          <section aria-labelledby="drawer-title" aria-modal="true" className="resource-drawer" role="dialog">
            <button aria-label="Close resource" className="drawer-close" onClick={() => setOpenResource(null)} type="button">×</button>
            <span className={`resource-status ${openResource.status}`}>{openResource.statusLabel}</span>
            <p className="resource-kicker">Phase {openResource.phase} - {openResource.label}</p>
            <h2 id="drawer-title">{openResource.title}</h2>
            <p className="drawer-description">{openResource.description}</p>
            <ol>{openResource.items.map((item) => <li key={item}>{item}</li>)}</ol>
            {openResource.note && <aside>{openResource.note}</aside>}
            <button className="drawer-done" onClick={() => setOpenResource(null)} type="button">Return to the timeline</button>
          </section>
        </div>
      )}
    </main>
  );
}
