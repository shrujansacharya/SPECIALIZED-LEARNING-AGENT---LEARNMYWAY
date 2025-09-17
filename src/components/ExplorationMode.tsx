import React, { useEffect, useState } from 'react';
import { Rocket, Trophy, Star } from 'lucide-react';

type Activity = Database['public']['Tables']['activities']['Row'];

export const ExplorationMode = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
    fetchProfile();
  }, []);

  const fetchActivities = async () => {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('type', 'exploratory');

    if (error) {
      console.error('Error fetching activities:', error);
    } else {
      setActivities(data || []);
    }
    setLoading(false);
  };

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
      }
    }
  };

  const handleActivityClick = async (activityId: string) => {
    if (!profile) return;

    const completedActivities = [...(profile.completed_activities || [])];
    if (!completedActivities.includes(activityId)) {
      completedActivities.push(activityId);

      const { error } = await supabase
        .from('profiles')
        .update({
          completed_activities: completedActivities,
          points: (profile.points || 0) + 10
        })
        .eq('user_id', profile.user_id);

      if (error) {
        console.error('Error updating profile:', error);
      } else {
        setProfile({
          ...profile,
          completed_activities: completedActivities,
          points: (profile.points || 0) + 10
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 to-indigo-500 p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 to-indigo-500 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Explore & Learn</h1>
          <div className="bg-white rounded-lg px-4 py-2 flex items-center space-x-2">
            <Star className="text-yellow-400" />
            <span className="font-bold">{profile?.points || 0} Points</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity) => {
            const isCompleted = profile?.completed_activities?.includes(activity.id);
            
            return (
              <div
                key={activity.id}
                className={`bg-white rounded-xl p-6 transform transition-all duration-300 hover:scale-105 ${
                  isCompleted ? 'border-4 border-green-400' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-800">{activity.title}</h3>
                  {isCompleted && (
                    <Trophy className="text-green-400" />
                  )}
                </div>
                <p className="text-gray-600 mb-4">{activity.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {activity.interest_tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => handleActivityClick(activity.id)}
                  className={`w-full py-3 rounded-lg flex items-center justify-center space-x-2 ${
                    isCompleted
                      ? 'bg-green-100 text-green-600'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  <Rocket size={20} />
                  <span>{isCompleted ? 'Completed!' : 'Start Activity'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};