# Māori Principles and Data Sovereignty in ForeXchange

<!--
  This one-page report explains how Tikanga Māori principles and Māori Data
  Sovereignty are integrated into the ForeXchange project — a real-time forex
  remittance and compliance monitoring dashboard built with FastAPI, React,
  PostgreSQL, and Docker.
-->

## 1. Four Tikanga Principles

### Pūkenga & Ōtakapopo — Expertise and Community Engagement

<!-- Community participation must begin at the design phase, not the end. -->

ForeXchange is designed as a culturally aware platform. The UI incorporates
**Māori language elements** such as a *Kia ora* greeting on the dashboard and
optional *Reo Māori* interface labels, making the system accessible to
Māori-speaking users. The project README explicitly invites feedback from
Māori communities and stakeholders, ensuring consultation starts from the
**earliest planning stage** rather than being treated as a final checklist item
(MBIE, 2023).

### Whānaungatanga — Transparency and Ethical Practice

<!-- Whānaungatanga demands honest communication about data usage. -->

ForeXchange implements **role-based access control** (Customer / Auditor) so
every data access is logged and traceable. Users see a clear **Privacy Notice**
during registration explaining what personal data (email, full name, IBAN) is
collected and why. The JWT-based authentication system ensures that users can
verify exactly when and how their data is being used, aligning with the
principle of **transparent, ethical data stewardship** (Health Research Council,
2022).

### Pāranga & KaTika — Data Governance and Quality

<!-- Data governance ensures collected data is accurate, secure, and valuable. -->

The backend uses **PostgreSQL** with SQLModel ORM, enforcing schema-level
validation and referential integrity. All passwords are hashed using
**Argon2id + Bcrypt** via the `pwdlib` library, never stored in plain text.
Sensitive fields such as `recipient_iban` and `compliance_details` are
accessible only to authorised Auditor-role users. The **AML compliance engine**
runs four automated rules (large amount, high-risk country, random spot-check,
structuring detection) and records every decision in a structured JSON audit
trail, following the **raw data → information → knowledge → insight → decision**
governance pipeline (Hevner et al., 2004).

### Tapu & Noa — Balancing Risk and Benefit

<!-- Tapu/Noa teaches us to weigh the benefits of data use against its risks. -->

Every remittance transaction is automatically assigned a **compliance score**
(0–100). Flagged transactions (score > 30) enter a review queue visible only to
Auditor users, who can **approve or reject** them with recorded rationale. This
implements a **risk mitigation strategy**: the system benefits from automated
efficiency while protecting users and the community from potential financial
harm. Users also retain the **right to deletion** (`DELETE /users/me` endpoint),
ensuring their data can be returned to a *Noa* (unrestricted) state on request.

## 2. Māori Data Sovereignty

<!-- Data sovereignty means Māori maintain inherent rights over their data. -->

ForeXchange embeds **Māori Data Sovereignty** principles throughout its data
lifecycle (Te Mana Raraunga, 2018):

| Stage          | Implementation                                                        |
|----------------|-----------------------------------------------------------------------|
| **Collection** | Explicit consent at registration; minimal data principle (email, name) |
| **Storage**    | Encrypted at rest (PostgreSQL); passwords hashed with Argon2 + Bcrypt |
| **Access**     | Role-based JWT tokens; Auditor-only access to compliance data         |
| **Deletion**   | Full account deletion via `DELETE /users/me`; no residual copies      |
| **Audit**      | `compliance_details` JSON logs every review action for accountability  |

These practices protect **all users**, not just Māori — a principle emphasised
in both the lecture and the compliance requirements of New Zealand funding
bodies such as **MBIE** and **HRC** (Māori Data Sovereignty Network, 2018).

## 3. Lifecycle Integration

<!-- Embedding principles from planning through implementation. -->

- **Planning & Design** — Data sovereignty requirements were included in the
  functional specifications; role-based access was designed from Day 1.
- **Development** — Security headers (`X-Content-Type-Options`, `X-Frame-Options`,
  `X-XSS-Protection`) and CORS whitelisting protect data in transit.
- **Implementation** — The compliance dashboard provides transparent,
  auditable decision trails; community feedback channels are documented in the
  README.

## 4. Conclusion

By weaving the **four Tikanga principles** and **Māori Data Sovereignty** into
ForeXchange's architecture, the project moves beyond mere compliance toward
genuine cultural respect. The resulting system is **more secure, more
transparent, and more trustworthy** for every user.

---

### References

- Health Research Council. (2022). *Māori Health Research Guidelines*.
- Hevner, A. R., March, S. T., Park, J., & Ram, S. (2004). Design science in
  information systems research. *MIS Quarterly*, 28(1), 75–105.
- Māori Data Sovereignty Network / Te Mana Raraunga. (2018). *Principles of
  Māori Data Sovereignty*.
- MBIE. (2023). *Te Ara Paerangi – Future Pathways: Māori Engagement Framework*.
