import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const PERFILES = ['jefatura', 'asesor'];

// Sin user_id: aplica al usuario actual el perfil que le corresponde según el equipo oficial (Integrante).
// Con user_id + perfil: solo Jefatura (admin) puede asignar el perfil de otra persona.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!me) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const { user_id, perfil } = await req.json().catch(() => ({}));
    const sr = base44.asServiceRole;

    if (user_id) {
      if (me.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });
      if (!PERFILES.includes(perfil)) return Response.json({ error: 'Perfil inválido' }, { status: 400 });
      const target = await sr.entities.User.get(user_id).catch((e) => (e.status === 404 ? null : Promise.reject(e)));
      if (!target) return Response.json({ error: 'Usuario no encontrado' }, { status: 404 });
      const role = perfil === 'jefatura' ? 'admin' : target.id === me.id ? target.role : 'user';
      await sr.entities.User.update(target.id, { perfil, role });
      return Response.json({ perfil });
    }

    if (me.perfil) return Response.json({ perfil: me.perfil });
    const email = String(me.email || '').toLowerCase();
    const equipo = await sr.entities.Integrante.list('nombre', 200);
    const i = equipo.find((x) => String(x.email || '').toLowerCase() === email);
    if (!i || !PERFILES.includes(i.perfil)) return Response.json({ perfil: null });
    const role = i.perfil === 'jefatura' || me.role === 'admin' ? 'admin' : 'user';
    await sr.entities.User.update(me.id, { perfil: i.perfil, role });
    return Response.json({ perfil: i.perfil });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}