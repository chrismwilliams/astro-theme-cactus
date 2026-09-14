---
title: "Making Organizational Expertise Available through Shared AI Workflows"
description: "An industry design and engineering project turns company knowledge and work practices into reusable AI workflows that people can inspect, revise, and share."
publishDate: "2026-09-13"
status: "Industry design and engineering project"
researchArea: "industry"
order: 4
featured: false
coverImage: "/3-design.png"
tags: ["Agentic AI", "Distributed Expertise", "Knowledge Work"]
---

## The problem in practice

I worked with an international e-commerce business whose employees had adopted AI but used it in different ways. For complex tasks such as market research, the quality and structure of a deliverable depended on how an employee articulated the request and supplied company context. Valuable knowledge about how to do the work remained difficult to share.

The project asked how company expertise and work practices could become reusable resources for the whole team.

## What I designed and built

I designed and developed an agentic AI platform organized around shared workflows. A workflow specifies a sequence of steps, the information each step needs, and the company standards that should guide the output. Employees access this support through a web interface or Lark, the team’s messaging tool.

For a market-research task, a workflow can organize information gathering, synthesis, application of company context, and delivery of a formatted report. A recorded execution history lets the team inspect how the work proceeded and identify where an output needs revision.

The platform also allows people with domain expertise to describe how a task should be performed and collaborate with AI to turn that knowledge into an executable workflow. They can refine it through natural-language instructions or specify individual steps directly.

## Keeping shared knowledge revisable

Work practices change, and a shared workflow needs a way to change with them. The system is designed to use recurring revision requests as signals of where a workflow may need improvement. Proposed updates go through human review before they become shared practice.

This raises an organizational design question alongside the technical one: who can contribute expertise, who reviews changes, and how can users understand and contest the standards embedded in a workflow?

## Connection to my research

This industry project gives practical form to my interest in making distributed expertise available across an organization. It connects to my [coaching research](/posts/ai-coaching), where expert knowledge guides AI behavior and remains open to revision.

Shared standards also raise questions about when consistency is helpful and when it suppresses useful variation. My [research on collective AI outcomes](/posts/double-compression) provides a complementary perspective on why the effects of common AI support need to be evaluated at the group level.

This page describes an applied system and its design goals. Effects on organizational learning, output quality, and coordination would require dedicated empirical evaluation.

## Partner and system

Industry collaborator: Novohaven Inc.

[System code](https://github.com/eveyhuang/novohaven) · [All research and projects](/posts)
