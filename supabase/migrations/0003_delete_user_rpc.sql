-- Atomic user data deletion across all tables
CREATE OR REPLACE FUNCTION delete_user_data(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM chat_messages WHERE user_id = p_user_id;
  DELETE FROM cook_sessions WHERE user_id = p_user_id;
  DELETE FROM fridge_scans WHERE user_id = p_user_id;
  DELETE FROM shopping_list_items WHERE user_id = p_user_id;
  DELETE FROM notifications WHERE user_id = p_user_id;
  DELETE FROM saved_recipes WHERE user_id = p_user_id;
  DELETE FROM tts_usage WHERE user_id = p_user_id;
  DELETE FROM profiles WHERE user_id = p_user_id;
END;
$$;
