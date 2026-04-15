import React, { useState, useEffect } from "react";
import { message, Spin } from "antd";
import useAuth from "@hooks/useAuth";
import profileService from "@services/profileService";
import useLoading from "@hooks/useLoading";

// New Components
import ProfileLayout from "@components/ProfileLayout/ProfileLayout";
import ProfileInfo from "@components/ProfileInfo/ProfileInfo";
import ProfileSkeleton from "@components/ProfileSkeleton/ProfileSkeleton";
// Placeholder for components we haven't refactored yet
// import ProfileAddresses from "@components/ProfileAddresses/ProfileAddresses";
// import ProfilePassword from "@components/ProfilePassword/ProfilePassword";

import styles from "./Profile.module.css";

const Profile = () => {
  const { isAuthenticated } = useAuth();
  const { loading, setLoading } = useLoading();
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("info");

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await profileService.getProfile();
      setProfile(response.data.data);
    } catch (error) {
      message.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "info":
        return <ProfileInfo profile={profile} loading={loading} onSuccess={setProfile} />;
      case "orders":
        return <div>Orders Component (Coming soon)</div>;
      case "addresses":
        return <div>Addresses Component (Migrating...)</div>;
      case "payment":
        return <div>Payment Component (Coming soon)</div>;
      case "favorites":
        return <div>Favorites Component (Coming soon)</div>;
      case "password":
        return <div>Password Component (Migrating...)</div>;
      default:
        return <ProfileInfo profile={profile} loading={loading} onSuccess={setProfile} />;
    }
  };

  if (loading && !profile) {
    return (
      <ProfileLayout
        activeTab={activeTab}
        onTabSelect={setActiveTab}
        profileData={profile}
      >
        <ProfileSkeleton />
      </ProfileLayout>
    );
  }

  return (
    <ProfileLayout 
      activeTab={activeTab} 
      onTabSelect={setActiveTab} 
      profileData={profile}
    >
      {renderContent()}
    </ProfileLayout>
  );
};

export default Profile;
