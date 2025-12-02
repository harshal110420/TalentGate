export const getFallbackEnterpriseId = (user) => {
  return (
    user.selectedEnterprise || 
    user.lastLoggedInEnterprise?._id ||
    user.createInEnterprise?._id ||
    user.enterprises?.[0]?._id ||
    null
  );
};
