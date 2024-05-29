---
company: NCR Voyix
dateRange: January 2024 - April 2024
role: Software Developer
image: /images/voyix.png
---

In the winter of 2024, I returned to NCR Voyix, previously a part of NCR Corporation, as a software developer co-op. During my work term, I worked on a suite of banking collaboration services and web tools that power the operations of multiple banks in North America. This experience helped me aquire vital skills in cloud computing and further developed my ability to design highly scalable and maintainable software solutions.

## Collaboration Services Project
Kicking off my co-op term at Voyix, I was onboarded to a new project where the team was building a suite of collaboration services bridging remote bank tellers and customers on interactive teller machines (ITMs).

I was tasked to create a proxy server that returns sensitive static content of different formats to the client. The content was to be encrypted, using a data encryption key (DEK) which itself is encrypted with a master encryption key (MEK), and stored on multiple cloud providers including Google's storage buckets. 

To achieve the above, I had to ramp up on a few technologies and development operations tools. For the proxy server, I used NGINX to route to the different cloud providers, as well as NGINX's node distribution, NJS, to implement the decryption logic. Additionally, I gained expertise building Jenkins pipelines, deploying services to Kubernetes using helm charts, and securely maintaining configurations and encryption keys in Kubernetes secrets and configuration maps.  

My team ended up moving to a different project towards the middle of my co-op term, which required me to host knowledge transfer sessions for the next developers to extend the functionality of the service. The proxy server code and design were thoroughly documented and then seamlessly reused by a couple internal teams across the company extending the impact of my work. 

The collaboration services project presented numerous design challenges, which helped me utilize the opportunity to take initiative and collaborate closely with my team's software architect on the design and come up with competing approaches to reach an optimal solution. I learnt many vital concepts like MEK, DEK encryption approaches and response chunking implementations to handle large file transfers, which I will carry over and apply when presented with similar problems in the future.  

## Bank Teller Web Tools
For the second part of my work term, I was tasked to extend the functionalities of Voyix's main bank teller website, where I contributed to both the frontend and the backend of the web application. 

The new functionalities consisted of handling sensitive transactions like money transfers between accounts and exchanging cash shipments between branches. The as-is functionalities and flows were complex making the requirements seem abstract and challenging to navigate. I worked closely with our team's dev lead and product owners to quickly onboard to the existing flows and gain a better understanding of the requirements. Additionally, I raised edge cases early on in the design process to effectively meet tight deadlines, while maintaining a robust data integrity process. 

In this project, I further developed my freshly acquired skills in Google Cloud Platform and Kubernetes as I deployed my features to my team's cluster at the end of each sprint. I also got hands on experience working on micro frontends in a react monorepo, adding to my expertise in building loosely coupled, modular code, enabling NCR Voyix to continue to meet each financial institution's unique requirements and use cases.  

## My Experience
My co-op at NCR Voyix was a great and successful return to my team. I was put on an accelerated onboarding process and started learning new skills and contributing to the team from my first week. 

I applied new design patterns fine-tuned and geared towards both unique and common problems. Additionally, I equipped myself with a set of new technologies further preparing me to adopt more responsibility in my future work experiences.

The projects that I worked on perfectly aligned with my learning goals for my co-op term and helped me utilize the opportunity to exceed expectations with the new technical expertise and soft skills acquired throughout the winter. 

## Acknowledgement
Thank you to my team's dev lead [Yuktika Pahwa](https://www.linkedin.com/in/yuktika-pahwa-15ab0934/) and architect [Clifford Mathew](https://www.linkedin.com/in/clifford-mathew-1323603/), who both helped me understand the business impact we provided through our work, and assisted me in gathering and understanding the requirements for my projects. 

Finally, thank you to my team for all the assistance and support they provided me to lead another successful co-op term at NCR Voyix! 
