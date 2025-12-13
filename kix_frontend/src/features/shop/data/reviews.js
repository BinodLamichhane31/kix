export const reviewSeeds = {
  global: [
    {
      id: 'global-1',
      name: 'Sujan R.',
      rating: 5,
      title: 'Perfect daily pair',
      body: 'Seriously comfy and the breathable mesh keeps my feet cool. Love the customizable color blocking.',
      date: '2 days ago',
    },
    {
      id: 'global-2',
      name: 'Mira L.',
      rating: 4,
      title: 'Worth every rupee',
      body: 'The stitching quality feels premium. Delivery to Kathmandu was fast and packaging was slick.',
      date: '1 week ago',
    },
  ],
};

export function getSeedReviews(key = 'global') {
  if (reviewSeeds[key]) return [...reviewSeeds[key]];
  return [...reviewSeeds.global];
}


