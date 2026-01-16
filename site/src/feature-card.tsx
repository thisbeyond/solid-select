export const FeatureCard = (props) => {
  return (
    <div class="flex flex-col flex-1 bg-white rounded-t rounded-b-none overflow-hidden shadow p-6">
      <div class="w-full font-bold text-xl text-gray-800">{props.title}</div>
      <p class="text-gray-800 text-base">{props.children}</p>
    </div>
  );
};
