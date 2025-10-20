function ToyCard({ r, pb, isAdmin, onEdit, onDelete }: {
    r: any; pb: any; isAdmin?: boolean;
    onEdit?: (r:any)=>void; onDelete?: (r:any)=>void;
}) {
    const file = r.photo?.[0];
    const img = file ? pb.files.getUrl(r, file, { thumb: "800x0" }) : undefined;

    return (
        <div style={{border:'1px solid #eee', borderRadius:12, padding:12}}>
            <div style={{aspectRatio:'4/3', overflow:'hidden', borderRadius:8, background:'#f3f3f3'}}>
                {img ? <img src={img} alt={r.description || r.brand || r.id} style={{width:'100%', height:'100%', objectFit:'cover'}}/> : 'Pas d’image'}
            </div>

            <h3 style={{margin:'8px 0 0'}}>{r.description || 'Sans titre'}</h3>
            {r.brand && <div style={{color:'#666', fontSize:14}}>{r.brand}</div>}
            {typeof r.price === 'number' && <div style={{marginTop:4}}>{r.price} €</div>}

            {isAdmin && (
                <div style={{display:'flex', gap:8, marginTop:8}}>
                    <button onClick={() => onEdit?.(r)}>Éditer</button>
                    <button
                        style={{color:'#b00020'}}
                        onClick={() => { if (confirm('Supprimer ?')) onDelete?.(r); }}
                    >Supprimer</button>
                </div>
            )}
        </div>
    );
}
