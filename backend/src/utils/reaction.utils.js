const formatReactionResponse = (reaction) => ({
  reaction_id: reaction.reaction_id,
  expense_id: reaction.expense_id,
  user_id: reaction.user_id,
  reaction: reaction.reaction,
  created_at: reaction.created_at,
  user: reaction.user
    ? {
        user_id: reaction.user.user_id,
        name: reaction.user.name,
        email: reaction.user.email,
      }
    : undefined,
});

module.exports = { formatReactionResponse };
