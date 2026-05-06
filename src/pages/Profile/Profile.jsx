import React, { useState, useEffect } from "react";
import { message } from "antd";
import useAuth from "@hooks/useAuth";
import profileService from "@services/profileService";
import useLoading from "@hooks/useLoading";

// Components
import ProfileLayout from "@components/ProfileLayout/ProfileLayout";
import ProfileHeader from "@components/ProfileHeader/ProfileHeader";
import ProfileInfo from "@components/ProfileInfo/ProfileInfo";
import ProfileSkeleton from "@components/ProfileSkeleton/ProfileSkeleton";
import ProfileAddresses from "@components/ProfileAddresses/ProfileAddresses";
import ProfileOrders from "@components/ProfileOrders/ProfileOrders";
import ProfileFavorites from "@components/ProfileFavorites/ProfileFavorites";
import ProfilePayment from "@components/ProfilePayment/ProfilePayment";
import ProfileSettings from "@components/ProfileSettings/ProfileSettings";
import ProfilePassword from "@components/ProfilePassword/ProfilePassword";

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
        return <ProfileOrders />;
      case "addresses":
        return <ProfileAddresses />;
      case "payment":
        return <ProfilePayment />;
      case "favorites":
        return <ProfileFavorites />;
      case "password":
        return <ProfilePassword />;
      case "settings":
        return <ProfileSettings />;
      case "notifications":
        return <ProfileSettings />; // Reuse settings for now
      case "vouchers":
        return <ProfilePayment />; // Reuse payment for placeholder
      default:
        return <ProfileInfo profile={profile} loading={loading} onSuccess={setProfile} />;
    }
  };

  if (loading && !profile) {
    return (
      <ProfileLayout
        activeTab={activeTab}
        onTabSelect={setActiveTab}
      >
        <ProfileSkeleton />
      </ProfileLayout>
    );
  }

  return (
    <ProfileLayout 
      activeTab={activeTab} 
      onTabSelect={setActiveTab} 
    >
      <ProfileHeader />
      {renderContent()}
    </ProfileLayout>
  );
};

export default Profile;
