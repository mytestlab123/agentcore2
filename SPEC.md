# Specification

Status: ACTIVE
Owner: Issue #3 — Rapid AgentCore compliance lab

## Objective

Build a rapid personal-LAB learning platform that proves multiple Amplify operator
experiences can share one governed AgentCore/compliance-remediation backend.

## Scope

Execute Issue #3 milestones M1-M5 continuously:
- mock-first shared contracts and Preview A;
- at least three Amplify preview experiences;
- one genuine AgentCore Harness specialist;
- one bounded, human-approved disposable-LAB remediation;
- evidence, cleanup, learning notes, and harvest recommendations.

## MUST

- use one shared finding/remediation/evidence contract across previews;
- visibly label MOCK, RECORDED, and LIVE LAB states;
- use AgentCore Harness first;
- keep remediation deterministic behind policy/approval gates;
- separate provider readback from Config/compliance convergence;
- persist execution IDs before retrying long-running AWS work;
- verify personal LAB identity and ap-southeast-1 before the first AWS write;
- stay within the Issue #3 experimental cost boundary;
- keep system-level Crew/Kiro/Codex/MCP configuration in dotfiles.

## MUST NOT

- use office/GovTech/GCC/PROD or cross-account scope;
- publish credentials, private findings, account secrets, or internal data;
- use AdministratorAccess as a shortcut;
- expose anonymous mutation APIs;
- execute model-generated destructive shell commands;
- silently present synthetic success as live evidence;
- depend on local Crew until durable evidence says CREW_READY=YES.

## Verification

Milestone evidence is defined by Issue #3. Live claims require deployed revision,
runtime/agent/model/session identity, exact target, tool/action, approval record,
AWS-native execution ID, provider readback, compliance readback, and cleanup state.

## Stop Gates

Use only the hard stop gates in Issue #3: unauthorized environment/scope,
non-canary destructive mutation, broad IAM, secret exposure/rotation, anonymous
mutation exposure, material spend expansion, unsafe cross-Region execution, or
failed safety/identity validation.
