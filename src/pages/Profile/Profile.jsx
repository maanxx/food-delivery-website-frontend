import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { message } from "antd";
import useAuth from "@hooks/useAuth";
import profileService from "@services/profileService";
import useLoading from "@hooks/useLoading";
import { fetchUserFavorites } from "@features/user/userSlice";

import ProfileLayout from "@components/ProfileLayout/ProfileLayout";
import ProfileInfo from "@components/ProfileInfo/ProfileInfo";
import ProfileSkeleton from "@components/ProfileSkeleton/ProfileSkeleton";
import ProfileAddresses from "@components/ProfileAddresses/ProfileAddresses";
import ProfileOrders from "@components/ProfileOrders/ProfileOrders";
import ProfileFavorites from "@components/ProfileFavorites/ProfileFavorites";

const Profile = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const { loading, setLoading } = useLoading();
  const [profile, setProfile] = useState(null);
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab") || "info";
  const [activeTab, setActiveTab] = useState(tabFromUrl);

  useEffect(() => {
    setActiveTab(tabFromUrl);
  }, [tabFromUrl]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
      dispatch(fetchUserFavorites());
    }
  }, [dispatch, isAuthenticated]);

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
        return <div>Payment Component (Coming soon)</div>;
      case "favorites":
        return <ProfileFavorites />;
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
