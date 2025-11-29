"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "contentful";
import { Github, Linkedin, Instagram, Mail, ChevronDown, ChevronUp } from "lucide-react";
import GlassyNavbar from "../../components/GlassyNavbar";
import DotGrid from "../../components/DotGrid";

// Contentful Client
const client = createClient({
    space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID,
    accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN,
});

export default function TeamPage() {
    const router = useRouter();
    const [selectedYear, setSelectedYear] = useState(2025);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openTeams, setOpenTeams] = useState({});

    const years = [2025, 2024, 2023];

    const toggleTeam = (teamName) => {
        setOpenTeams((prev) => ({
            ...prev,
            [teamName]: !prev[teamName],
        }));
    };

    useEffect(() => {
        const fetchMembers = async () => {
            setLoading(true);
            try {
                const response = await client.getEntries({
                    content_type: "memberProfile",
                    "fields.year": selectedYear,
                });

                const formatted = response.items.map((item) => {
                    const imgUrl = item.fields.photo?.fields?.file?.url;
                    return {
                        id: item.sys.id,
                        name: item.fields.name,
                        role: item.fields.role,
                        team: item.fields.team,
                        image: imgUrl ? (imgUrl.startsWith("//") ? `https:${imgUrl}` : imgUrl) : null,
                        generalMembers: item.fields.generalMembers,
                        socials: {
                            linkedin: item.fields.linkedin,
                            github: item.fields.github,
                            instagram: item.fields.instagram,
                            email: item.fields.email,
                        },
                    };
                });

                setMembers(formatted);
            } catch (err) {
                console.error("Error fetching members:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchMembers();
    }, [selectedYear]);

    // Filtering Logic (from File A)
    const leadership = members.filter(
        (m) =>
            m.role?.toLowerCase().includes("chair") ||
            m.role?.toLowerCase().includes("president")
    );

    const coreTeam = members.filter(
        (m) =>
            !m.role?.toLowerCase().includes("chair") &&
            !m.role?.toLowerCase().includes("president")
    );

    const teamsWithMembers = members
        .filter((m) => m.generalMembers)
        .map((m) => ({
            teamName: m.team,
            leadName: m.name,
            memberList: m.generalMembers.split(",").map((s) => s.trim()),
        }));

    return (
        <div style={{ width: "100%", minHeight: "100vh", position: "relative" }}>
            {/* Background */}
            <div style={{ position: "fixed", inset: 0, zIndex: 0 }}>
                <DotGrid
                    dotSize={3}
                    gap={15}
                    baseColor="#073b0d"
                    activeColor="#128224"
                    proximity={120}
                    shockRadius={250}
                    shockStrength={5}
                    resistance={750}
                    returnDuration={1.5}
                />
            </div>

            <div style={{ position: "relative", zIndex: 1 }}>
                <GlassyNavbar />

                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        padding: "140px 40px 40px",
                        color: "white",
                        minHeight: "100vh",
                    }}
                >
                    <h1 style={{ fontSize: "4rem", fontWeight: "bold", marginBottom: "20px", color: "#46b94e" }}>
                        Our Team
                    </h1>

                    {/* Year Toggle */}
                    <div
                        style={{
                            display: "flex",
                            background: "rgba(255,255,255,0.1)",
                            borderRadius: "40px",
                            padding: "5px",
                            marginBottom: "50px",
                            backdropFilter: "blur(10px)",
                        }}
                    >
                        {years.map((year) => (
                            <button
                                key={year}
                                onClick={() => setSelectedYear(year)}
                                style={{
                                    background: selectedYear === year ? "#46b94e" : "transparent",
                                    color: "white",
                                    border: "none",
                                    padding: "10px 24px",
                                    borderRadius: "40px",
                                    cursor: "pointer",
                                    fontWeight: selectedYear === year ? "bold" : "normal",
                                }}
                            >
                                {year}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <div style={{ maxWidth: "1200px", width: "100%", display: "flex", flexDirection: "column", gap: "80px" }}>

                            {/* Leadership */}
                            {leadership.length > 0 && (
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "30px" }}>
                                    {leadership.map((member) => (
                                        <MemberCard key={member.id} member={member} big router={router} />
                                    ))}
                                </div>
                            )}

                            {/* Core Team */}
                            {coreTeam.length > 0 && (
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "30px" }}>
                                    {coreTeam.map((member) => (
                                        <MemberCard key={member.id} member={member} router={router} />
                                    ))}
                                </div>
                            )}

                            {/* General Members Accordion */}
                            {teamsWithMembers.length > 0 && (
                                <div>
                                    <h2 style={{ textAlign: "center", marginBottom: "40px", color: "#46b94e", fontSize: "2.5rem" }}>
                                        General Members
                                    </h2>

                                    <div style={{ display: "grid", gap: "20px" }}>
                                        {teamsWithMembers.map((team, idx) => (
                                            <div
                                                key={idx}
                                                style={{
                                                    background: "rgba(255,255,255,0.05)",
                                                    borderRadius: "15px",
                                                    border: "1px solid rgba(255,255,255,0.1)",
                                                }}
                                            >
                                                <button
                                                    onClick={() => toggleTeam(team.teamName)}
                                                    style={{
                                                        width: "100%",
                                                        padding: "20px 30px",
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        alignItems: "center",
                                                        background: "transparent",
                                                        border: "none",
                                                        color: "white",
                                                        fontSize: "1.2rem",
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    {team.teamName} Team
                                                    {openTeams[team.teamName] ? <ChevronUp /> : <ChevronDown />}
                                                </button>

                                                {openTeams[team.teamName] && (
                                                    <div style={{ padding: "0 30px 30px", display: "flex", flexWrap: "wrap", gap: "12px" }}>
                                                        {team.memberList.map((name, i) => (
                                                            <span
                                                                key={i}
                                                                style={{
                                                                    padding: "8px 16px",
                                                                    background: "rgba(70,185,78,0.2)",
                                                                    borderRadius: "20px",
                                                                    fontSize: "0.9rem",
                                                                }}
                                                            >
                                                                {name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Unified Card Component (Design from B, Data from A)
function MemberCard({ member, router, big = false }) {
    return (
        <div
            onClick={() => router.push(`/pages/team/${member.id}`)}
            style={{
                background: "rgba(255,255,255,0.08)",
                borderRadius: "20px",
                padding: big ? "45px 35px" : "30px 20px",
                textAlign: "center",
                cursor: "pointer",
                transition: "transform 0.3s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-5px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        >
            <div
                style={{
                    width: big ? "160px" : "120px",
                    height: big ? "160px" : "120px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "3px solid #46b94e",
                    margin: "0 auto 15px",
                    background: "#111",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {member.image ? (
                    <img src={member.image} alt={member.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                    <span style={{ fontSize: "2.5rem", fontWeight: "bold" }}>{member.name[0]}</span>
                )}
            </div>

            <h3 style={{ fontSize: big ? "1.8rem" : "1.3rem" }}>{member.name}</h3>
            <p style={{ color: "#46b94e", fontSize: big ? "1.1rem" : "0.95rem" }}>{member.role}</p>

            <div style={{ display: "flex", gap: "14px", justifyContent: "center", marginTop: "10px" }}>
                {member.socials?.linkedin && (
                    <a href={member.socials.linkedin} target="_blank" onClick={(e) => e.stopPropagation()}>
                        <Linkedin size={18} />
                    </a>
                )}
                {member.socials?.github && (
                    <a href={member.socials.github} target="_blank" onClick={(e) => e.stopPropagation()}>
                        <Github size={18} />
                    </a>
                )}
                {member.socials?.instagram && (
                    <a href={member.socials.instagram} target="_blank" onClick={(e) => e.stopPropagation()}>
                        <Instagram size={18} />
                    </a>
                )}
                {member.socials?.email && (
                    <a href={`mailto:${member.socials.email}`} onClick={(e) => e.stopPropagation()}>
                        <Mail size={18} />
                    </a>
                )}
            </div>
        </div>
    );
}
