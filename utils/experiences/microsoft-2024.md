---
company: Microsoft Corporation
dateRange: May 2024 - July 2024
role: Software Engineering Intern
image: /images/microsoft-logo.webp
---

In my second internship at Microsoft during the summer of 2024, I returned to the lease acquisition team responsible for meeting hyperscale data center capacity demands during the current accelerating expansion of the cloud computing market. My main project focused on creating a partner engagement feature to efficiently track interactions with industry partners, ensuring the hyperscale data center (DC) capacity requirements were met. Additionally, I developed event-driven features within the Dynamics CRM sales platform and implemented advanced security architectures in compliance with Microsoft's evolving security standards.

### Partner Engagement Feature

During my internship, I designed and implemented a partner engagement feature that enabled the team to track any touchpoints with data center lease partners effectively. This feature aimed to streamline the lease acquisition process by ensuring that all communications, meetings, and interactions with partners were captured and recorded in the CRM system. By centralizing these engagements, our team could better assess the progress and ensure that all the steps necessary for new lease opportunities were tracked in real-time.

To achieve this, I worked closely with the product manager and stakeholders to understand the intricacies of partner relationships and the leasing process. My contributions reduced business costs and increased time savings of upwards to 75%, allowing the business team to have more transparency and visibility in their processes. 

### Email Notification System

In addition to the partner engagement feature, I was tasked with implementing email notifications for multiple events across the lease acquisition process. This system was designed to notify stakeholders when key milestones were reached, ensuring that all relevant parties remained informed. The notifications triggered for events such as new lease opportunities and partners progressing through the lease acquisition pipeline.

While these notifications were initially scoped as stretch goals, I successfully delivered this system by utilizing the Dynamics 365 workflows and building modular email client components to reuse them across the board for all lease events. The integration of this newly built notification system was used to send personalized, timely updates, helping to reduce the risk of missed opportunities and ensuring smooth communication during the leasing process. Additionally, the impact of this notification system extended beyond my features and team, as I conducted knowledge transfer sessions with members of other teams, enabling them to reuse some of the email client components to develop similar features.

### Security Improvements - MSI Adoption

A key highlight of this internship was my work on improving the security of one of my team's existing services. Initially, the service relied on client secrets for JWT authentication, which posed a security risk due to the secret's static nature, in addition to an availability risk in the case of failure to rotate the secret prior to its expiry date. My task was to migrate the authentication system to utilize a Managed Service Identity (MSI) and Federated Identity Credentials (FIC), providing a more secure and dynamic way to handle authentication.

This migration required me to learn new concepts in security and authentication, particularly around Azure Active Directory and its integration with Azure resources. By adopting MSI, I was able to eliminate the need for stored credentials, improving security and reducing maintenance overhead. This project was particularly rewarding, as it allowed me to deepen my understanding of cloud security best practices and advancements.

### My Experience

This internship allowed me to further develop my technical skills, particularly in the areas of cloud security, CRM platforms, and event-driven architecture. Working on the partner engagement feature taught me how to break down complex business problems into manageable technical solutions, and I became more proficient in project scoping and user-centric design.

Collaborating with multiple stakeholders also improved my soft skills in cross-functional communication, requirement gathering, and stakeholder management. Engaging with other teams to understand requirements and providing regular progress updates strengthened my ability to work in a dynamic and collaborative environment.

### Acknowledgment

I want to express my gratitude to my manager [Luis Suarez](https://www.linkedin.com/in/luis-m-suarez-8248624/) for his guidance and support throughout my internship. I would also like to thank my mentor [Somanwita Dey](https://www.linkedin.com/in/somanwita-dey/) for her technical insights, and [Judy Chu](https://www.linkedin.com/in/judychu/) for her support in helping me understand the leasing process and its business implications.

Finally, a big thank you to my team for their encouragement, and for creating a positive environment that enabled me to learn and grow throughout my journey at Microsoft!