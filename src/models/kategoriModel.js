import { supabase } from '../config/supabaseClient.js';

const TABLE = 'categories';

export const getAll = async () => {
  const { data, error } = await supabase.from(TABLE).select('*').order('name');
  if (error) throw error;
  return data;
};

export const getById = async (id) => {
  const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
};

export const create = async (payload) => {
  const { data, error } = await supabase.from(TABLE).insert(payload).select().single();
  if (error) throw error;
  return data;
};

export const update = async (id, payload) => {
  const { data, error } = await supabase.from(TABLE).update(payload).eq('id', id).select().maybeSingle();
  if (error) throw error;
  return data;
};

export const remove = async (id) => {
  const { data, error } = await supabase.from(TABLE).delete().eq('id', id).select().maybeSingle();
  if (error) throw error;
  return data;
};
