"use client";

import { useState, useEffect } from "react";
import { Mail, Linkedin, Github, MapPin, Briefcase } from "lucide-react";
import GlassyNavbar from "../../../components/MemberNavbar";
import Squares from "../../../components/Squares";
import { contentfulClient } from '@/lib/contentful';
import { Logo2 } from "../../../logo/logo2";

export default function AdrikaSarawatPage() {
    const [isHovered, setIsHovered] = useState(false);
    const [profileData, setProfileData] = useState({
        name: "Adrika Sarawat",
        role: "Vice Chairperson",
        memberId: "GFG-2024-2026",
        location: "SRM Institute of Science and Technology",
        email: "adrika@geeksforgeeks.com",
        linkedin: "linkedin.com/in/adrika-sarawat",
        github: "github.com/adrikasarawat",
        about: "Passionate developer with expertise in modern web technologies. I love building scalable applications and contributing to open-source projects. Always eager to learn new technologies and solve complex problems.",
        profileImage: "https://images.ctfassets.net/u39iu0kuz48f/4Rc3YNWdd96uMWsOA2wPHd/a0fd1329b0a1392fc8ddefb6782816bf/image.png",
        skills: [
            { name: "React", level: "Advanced", color: "#61DAFB" },
            { name: "Next.js", level: "Advanced", color: "#000000" },
            { name: "Node.js", level: "Intermediate", color: "#339933" },
            { name: "TypeScript", level: "Advanced", color: "#3178C6" },
            { name: "Python", level: "Intermediate", color: "#3776AB" },
            { name: "MongoDB", level: "Intermediate", color: "#47A248" },
            { name: "Git", level: "Advanced", color: "#F05032" },
            { name: "Docker", level: "Beginner", color: "#2496ED" },
        ],
    });

    // Fetch profile data from Contentful
    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const response = await contentfulClient.getEntries({
                    content_type: 'teamMember',
                    'fields.slug': 'adrika-sarawat',
                });

                if (response.items.length > 0) {
                    const member = response.items[0].fields;
                    setProfileData(prev => ({
                        ...prev,
                        name: member.name || prev.name,
                        role: member.role || prev.role,
                        memberId: member.memberId || prev.memberId,
                        location: member.location || prev.location,
                        email: member.email || prev.email,
                        linkedin: member.linkedin || prev.linkedin,
                        github: member.github || prev.github,
                        about: member.about || prev.about,
                        profileImage: member.profileImage?.fields?.file?.url || prev.profileImage,
                        skills: member.skills || prev.skills,
                    }));
                }
            } catch (error) {
                console.error('Error fetching profile data:', error);
                // Keep using default data on error
            }
        };

        fetchProfileData();
    }, []);

    return (
        <div style={{ width: "100%", minHeight: "100vh", position: "relative" }}>
            {/* Background */}
            <div style={{ position: "fixed", inset: 0, zIndex: 0 }}>
                <Squares
                    speed={0.5}
                    squareSize={40}
                    direction="diagonal"
                    borderColor="#333"
                    hoverFillColor="#222"
                />
            </div>

            {/* Foreground content */}
            <div style={{ position: "relative", zIndex: 1 }}>
                <GlassyNavbar backLink="/pages/team" backLabel="← Back to Team" />

                <main
                    style={{
                        minHeight: "100vh",
                        padding: "100px 40px 40px",
                        color: "white",
                    }}
                >
                    {/* Main Content Container */}
                    <div
                        style={{
                            maxWidth: "1400px",
                            margin: "0 auto",
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "40px",
                            alignItems: "start",
                            minHeight: "calc(100vh - 200px)",
                            paddingRight: "60px",
                        }}
                    >
                        {/* Left Side - Lanyard ID Card */}
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                position: "sticky",
                                top: "120px",
                            }}
                        >
                            {/* Lanyard String */}
                            <div
                                style={{
                                    position: "relative",
                                    animation: "swingLanyard 3s ease-in-out infinite",
                                    transformOrigin: "top center",
                                }}
                            >
                                {/* Lanyard Clip */}
                                <div
                                    style={{
                                        width: "40px",
                                        height: "20px",
                                        background: "linear-gradient(145deg, #444, #222)",
                                        borderRadius: "10px 10px 0 0",
                                        margin: "0 auto",
                                        position: "relative",
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "8px",
                                            height: "8px",
                                            background: "#666",
                                            borderRadius: "50%",
                                            position: "absolute",
                                            top: "6px",
                                            left: "50%",
                                            transform: "translateX(-50%)",
                                        }}
                                    />
                                </div>

                                {/* Lanyard String */}
                                <div
                                    style={{
                                        width: "4px",
                                        height: "80px",
                                        background: "linear-gradient(to bottom, #00ff88, #00cc6a)",
                                        margin: "0 auto",
                                        boxShadow: "0 0 10px rgba(0,255,136,0.3)",
                                    }}
                                />

                                {/* ID Card */}
                                <div
                                    style={{
                                        width: "320px",
                                        background: "linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
                                        backdropFilter: "blur(20px)",
                                        borderRadius: "20px",
                                        padding: "30px",
                                        border: "2px solid rgba(255,255,255,0.2)",
                                        boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(0,255,136,0.1)",
                                        position: "relative",
                                        overflow: "hidden",
                                        transition: "all 0.3s ease",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = "scale(1.05) rotateY(5deg)";
                                        e.currentTarget.style.boxShadow = "0 30px 80px rgba(0,0,0,0.6), 0 0 50px rgba(0,255,136,0.2)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "scale(1) rotateY(0deg)";
                                        e.currentTarget.style.boxShadow = "0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(0,255,136,0.1)";
                                    }}
                                >

                                    {/* Logo2 at Top Center */}
                                    <div
                                        style={{
                                            width: "120px",
                                            height: "auto",
                                            margin: "0 auto 20px",
                                        }}
                                    >
                                        <Logo2 />
                                    </div>

                                    {/* Profile Image */}
                                    <div
                                        style={{
                                            width: "160px",
                                            height: "160px",
                                            margin: "20px auto 20px",
                                            borderRadius: "50%",
                                            overflow: "hidden",
                                            border: "4px solid rgba(0,255,136,0.5)",
                                            boxShadow: "0 0 30px rgba(0,255,136,0.3), inset 0 0 20px rgba(0,0,0,0.3)",
                                            position: "relative",
                                        }}
                                    >
                                        <img
                                            src={profileData.profileImage}
                                            alt={profileData.name}
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                            }}
                                        />
                                    </div>

                                    {/* Name and Role */}
                                    <div style={{ textAlign: "center", marginTop: "20px" }}>
                                        <h2
                                            style={{
                                                fontSize: "26px",
                                                fontWeight: "700",
                                                marginBottom: "8px",
                                                background: "linear-gradient(135deg, #fff, #00ff88)",
                                                WebkitBackgroundClip: "text",
                                                WebkitTextFillColor: "transparent",
                                                backgroundClip: "text",
                                            }}
                                        >
                                            {profileData.name}
                                        </h2>
                                        <p
                                            style={{
                                                fontSize: "14px",
                                                color: "#00ff88",
                                                fontWeight: "500",
                                                letterSpacing: "1px",
                                            }}
                                        >
                                            {profileData.role}
                                        </p>
                                    </div>

                                    {/* ID Number */}
                                    <div
                                        style={{
                                            marginTop: "20px",
                                            padding: "10px",
                                            background: "rgba(0,0,0,0.3)",
                                            borderRadius: "8px",
                                            textAlign: "center",
                                            border: "1px solid rgba(0,255,136,0.2)",
                                        }}
                                    >
                                        <p style={{ fontSize: "11px", color: "#888", marginBottom: "4px" }}>
                                            MEMBER ID
                                        </p>
                                        <p
                                            style={{
                                                fontSize: "16px",
                                                fontWeight: "600",
                                                letterSpacing: "2px",
                                                color: "#00ff88",
                                            }}
                                        >
                                            {profileData.memberId}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - About Me and Technical Skills */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "24px", paddingTop: "60px", paddingLeft: "20px", marginLeft: "-30px" }}>
                            {/* About Me Section */}
                            <div
                                style={{
                                    background: "linear-gradient(145deg, rgba(20,20,25,0.95), rgba(10,10,15,0.9))",
                                    backdropFilter: "blur(30px)",
                                    borderRadius: "20px",
                                    padding: "28px 32px",
                                    border: "2px solid rgba(0,255,136,0.2)",
                                    boxShadow: "0 20px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
                                    position: "relative",
                                    overflow: "hidden",
                                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "translateY(-6px)";
                                    e.currentTarget.style.boxShadow = "0 25px 60px rgba(0,0,0,0.6), 0 0 40px rgba(0,255,136,0.15), inset 0 1px 0 rgba(255,255,255,0.12)";
                                    e.currentTarget.style.border = "2px solid rgba(0,255,136,0.4)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow = "0 20px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)";
                                    e.currentTarget.style.border = "2px solid rgba(0,255,136,0.2)";
                                }}
                            >
                                <div style={{ position: "relative", zIndex: 1 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                                        <div
                                            style={{
                                                width: "4px",
                                                height: "28px",
                                                background: "linear-gradient(180deg, #00ff88, #00cc6a)",
                                                borderRadius: "2px",
                                                boxShadow: "0 0 15px rgba(0,255,136,0.4)",
                                            }}
                                        />
                                        <h3
                                            style={{
                                                fontSize: "26px",
                                                fontWeight: "700",
                                                background: "linear-gradient(135deg, #ffffff, #00ff88)",
                                                WebkitBackgroundClip: "text",
                                                WebkitTextFillColor: "transparent",
                                                backgroundClip: "text",
                                                letterSpacing: "-0.3px",
                                                margin: 0,
                                            }}
                                        >
                                            About Me
                                        </h3>
                                    </div>

                                    <p
                                        style={{
                                            fontSize: "14px",
                                            lineHeight: "1.7",
                                            color: "rgba(255,255,255,0.85)",
                                            marginBottom: "20px",
                                            fontWeight: "400",
                                        }}
                                    >
                                        {profileData.about}
                                    </p>

                                    {/* Contact Info Grid */}
                                    <div
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: "1fr 1fr",
                                            gap: "12px",
                                            marginBottom: "16px",
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "10px",
                                                padding: "12px 14px",
                                                background: "rgba(0,255,136,0.05)",
                                                borderRadius: "12px",
                                                border: "1px solid rgba(0,255,136,0.15)",
                                                transition: "all 0.3s ease",
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = "rgba(0,255,136,0.08)";
                                                e.currentTarget.style.border = "1px solid rgba(0,255,136,0.25)";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = "rgba(0,255,136,0.05)";
                                                e.currentTarget.style.border = "1px solid rgba(0,255,136,0.15)";
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: "32px",
                                                    height: "32px",
                                                    background: "linear-gradient(135deg, rgba(0,255,136,0.15), rgba(0,255,136,0.08))",
                                                    borderRadius: "10px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <MapPin size={16} color="#00ff88" />
                                            </div>
                                            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.8)", flex: 1, lineHeight: "1.4" }}>
                                                {profileData.location}
                                            </span>
                                        </div>

                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "10px",
                                                padding: "12px 14px",
                                                background: "rgba(0,255,136,0.05)",
                                                borderRadius: "12px",
                                                border: "1px solid rgba(0,255,136,0.15)",
                                                transition: "all 0.3s ease",
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = "rgba(0,255,136,0.08)";
                                                e.currentTarget.style.border = "1px solid rgba(0,255,136,0.25)";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = "rgba(0,255,136,0.05)";
                                                e.currentTarget.style.border = "1px solid rgba(0,255,136,0.15)";
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: "32px",
                                                    height: "32px",
                                                    background: "linear-gradient(135deg, rgba(0,255,136,0.15), rgba(0,255,136,0.08))",
                                                    borderRadius: "10px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <Mail size={16} color="#00ff88" />
                                            </div>
                                            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.8)", flex: 1, lineHeight: "1.4" }}>
                                                {profileData.email}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Social Links */}
                                    <div style={{ display: "flex", gap: "12px" }}>
                                        <a
                                            href={`https://${profileData.linkedin}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                flex: 1,
                                                padding: "12px 16px",
                                                background: "linear-gradient(135deg, rgba(0,119,181,0.12), rgba(0,119,181,0.04))",
                                                border: "1.5px solid rgba(0,119,181,0.25)",
                                                borderRadius: "12px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: "8px",
                                                textDecoration: "none",
                                                color: "#0ea5e9",
                                                fontSize: "13px",
                                                fontWeight: "600",
                                                transition: "all 0.3s ease",
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = "linear-gradient(135deg, rgba(0,119,181,0.2), rgba(0,119,181,0.08))";
                                                e.currentTarget.style.transform = "translateY(-2px)";
                                                e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,119,181,0.25)";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = "linear-gradient(135deg, rgba(0,119,181,0.12), rgba(0,119,181,0.04))";
                                                e.currentTarget.style.transform = "translateY(0)";
                                                e.currentTarget.style.boxShadow = "none";
                                            }}
                                        >
                                            <Linkedin size={16} />
                                            LinkedIn
                                        </a>
                                        <a
                                            href={`https://${profileData.github}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                flex: 1,
                                                padding: "12px 16px",
                                                background: "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(139,92,246,0.04))",
                                                border: "1.5px solid rgba(139,92,246,0.25)",
                                                borderRadius: "12px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: "8px",
                                                textDecoration: "none",
                                                color: "#a78bfa",
                                                fontSize: "13px",
                                                fontWeight: "600",
                                                transition: "all 0.3s ease",
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(139,92,246,0.08))";
                                                e.currentTarget.style.transform = "translateY(-2px)";
                                                e.currentTarget.style.boxShadow = "0 8px 20px rgba(139,92,246,0.25)";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(139,92,246,0.04))";
                                                e.currentTarget.style.transform = "translateY(0)";
                                                e.currentTarget.style.boxShadow = "none";
                                            }}
                                        >
                                            <Github size={16} />
                                            GitHub
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Technical Skills Section */}
                            <div
                                style={{
                                    background: "linear-gradient(145deg, rgba(20,20,25,0.95), rgba(10,10,15,0.9))",
                                    backdropFilter: "blur(30px)",
                                    borderRadius: "20px",
                                    padding: "28px 32px",
                                    border: "2px solid rgba(0,255,136,0.2)",
                                    boxShadow: "0 20px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
                                    position: "relative",
                                    overflow: "hidden",
                                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "translateY(-6px)";
                                    e.currentTarget.style.boxShadow = "0 25px 60px rgba(0,0,0,0.6), 0 0 40px rgba(0,255,136,0.15), inset 0 1px 0 rgba(255,255,255,0.12)";
                                    e.currentTarget.style.border = "2px solid rgba(0,255,136,0.4)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow = "0 20px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)";
                                    e.currentTarget.style.border = "2px solid rgba(0,255,136,0.2)";
                                }}
                            >
                                <div style={{ position: "relative", zIndex: 1 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                                        <div
                                            style={{
                                                width: "4px",
                                                height: "28px",
                                                background: "linear-gradient(180deg, #00ff88, #00cc6a)",
                                                borderRadius: "2px",
                                                boxShadow: "0 0 15px rgba(0,255,136,0.4)",
                                            }}
                                        />
                                        <h3
                                            style={{
                                                fontSize: "26px",
                                                fontWeight: "700",
                                                background: "linear-gradient(135deg, #ffffff, #00ff88)",
                                                WebkitBackgroundClip: "text",
                                                WebkitTextFillColor: "transparent",
                                                backgroundClip: "text",
                                                letterSpacing: "-0.3px",
                                                margin: 0,
                                            }}
                                        >
                                            Technical Skills
                                        </h3>
                                    </div>

                                    <div
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                                            gap: "12px",
                                        }}
                                    >
                                        {profileData.skills.map((skill, index) => (
                                            <div
                                                key={skill.name}
                                                style={{
                                                    padding: "16px 20px",
                                                    background: `linear-gradient(135deg, ${skill.color}10, ${skill.color}04)`,
                                                    border: `1.5px solid ${skill.color}28`,
                                                    borderRadius: "14px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                                    animation: `fadeInUp 0.5s ease ${index * 0.06}s both`,
                                                    cursor: "pointer",
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = "translateY(-4px) scale(1.02)";
                                                    e.currentTarget.style.boxShadow = `0 12px 30px ${skill.color}35`;
                                                    e.currentTarget.style.border = `1.5px solid ${skill.color}60`;
                                                    e.currentTarget.style.background = `linear-gradient(135deg, ${skill.color}18, ${skill.color}06)`;
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = "translateY(0) scale(1)";
                                                    e.currentTarget.style.boxShadow = "none";
                                                    e.currentTarget.style.border = `1.5px solid ${skill.color}28`;
                                                    e.currentTarget.style.background = `linear-gradient(135deg, ${skill.color}10, ${skill.color}04)`;
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        fontSize: "14px",
                                                        fontWeight: "600",
                                                        color: "#ffffff",
                                                    }}
                                                >
                                                    {skill.name}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* CSS Animations */}
            <style jsx>{`
        @keyframes swingLanyard {
          0% {
            transform: rotate(3deg);
          }
          50% {
            transform: rotate(-3deg);
          }
          100% {
            transform: rotate(3deg);
          }
        }



        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 1024px) {
          main > div {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }
      `}</style>
        </div>
    );
}
