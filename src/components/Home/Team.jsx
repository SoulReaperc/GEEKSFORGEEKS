import { currentMembers } from "api/MemberAPI";
import styles from "styles/Home/Team.module.css";
import CircularGallery from "../Elements/CircularGallery";
import React from "react";
import Link from "next/link";


const Team = () => {
  const allMembers = [
    ...currentMembers.chapterLead,
    ...currentMembers.leadList
  ];

  const galleryItems = allMembers.map(member => ({
    image: `/images/Team/${member.img}`,
    text: member.name
  }));

  return (
    <section id="Team" style={{ height: '600px', position: 'relative' }}>
      <h2 className="section-title">Our Team</h2>
      <div style={{ width: '100%', height: '100%' }}>
        <CircularGallery
          items={galleryItems}
          bend={3}
          textColor="#ffffff"
          borderRadius={0.05}
        />
      </div>
      <div className={styles.container} style={{ marginTop: '20px', justifyContent: 'center', display: 'flex' }}>
        <Link href="/Core-Team-22" style={{ textDecoration: "none" }}>
          <button className={styles.container1}>Previous Members</button>
        </Link>
      </div>
    </section>
  );
};

export default Team;
