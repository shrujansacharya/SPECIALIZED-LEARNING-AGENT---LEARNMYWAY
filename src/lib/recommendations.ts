

interface Recommendation {
  type: 'quiz' | 'area' | 'career';
  id: string;
  reason: string;
}

export const generateRecommendations = async (userId: string): Promise<Recommendation[]> => {
  try {
    // Get user profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError) throw profileError;
    if (!profile) return [];

    // Get user's completed activities
    const completedActivities = profile.completed_activities || [];
    const unlockedAreas = profile.unlocked_areas || [];
    const interests = profile.interests || [];

    // Get all available quizzes and areas
    const { data: quizzes } = await supabase.from('quizzes').select('*');
    const { data: areas } = await supabase.from('areas').select('*');
    const { data: careers } = await supabase.from('careers').select('*');

    // Generate recommendations based on user's interests and progress
    const recommendations: Recommendation[] = [];

    // Recommend quizzes in unlocked areas that user hasn't completed
    if (quizzes) {
      quizzes.forEach(quiz => {
        if (unlockedAreas.includes(quiz.area_id) && !completedActivities.includes(quiz.id)) {
          recommendations.push({
            type: 'quiz',
            id: quiz.id,
            reason: `Reinforce ${quiz.difficulty.toLowerCase()} skills in this area`
          });
        }
      });
    }

    // Recommend areas related to user's interests
    if (areas) {
      areas.forEach(area => {
        if (!unlockedAreas.includes(area.id) && interests.some((i: string) => area.tags?.includes(i))) {
          recommendations.push({
            type: 'area',
            id: area.id,
            reason: `Matches your interest in ${interests.find((i: string) => area.tags?.includes(i))}`
          });
        }
      });
    }

    // Recommend careers related to user's interests and unlocked areas
    if (careers) {
      careers.forEach(career => {
        if (interests.some((i: string) => career.tags?.includes(i))) {
          recommendations.push({
            type: 'career',
            id: career.id,
            reason: `Matches your interest in ${interests.find((i: string) => career.tags?.includes(i))}`
          });
        }
      });
    }

    // If no recommendations, suggest some default ones
    if (recommendations.length === 0) {
      return [
        { type: 'quiz', id: 'quiz-1', reason: 'Start with a beginner quiz to build skills' },
        { type: 'area', id: 'cricket-kingdom', reason: 'Explore this popular learning area' },
        { type: 'career', id: '1', reason: 'Sports Analyst - matches common interests' }
      ];
    }

    // Return shuffled recommendations (max 3)
    return recommendations
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return [];
  }
};