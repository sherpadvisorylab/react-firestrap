import Grid from '../components/widgets/Grid';
import React, { useState } from 'react'
import BlogPost from './BlogPost'
import { RecordProps } from 'integrations/google/firedatabase';

interface Post {
    title: string;
    description: string;
    outline: string;
    sections: {}[];
}

function Blog() {

    const [posts, setPosts] = useState<Post[]>([]);

    const columns = [
        { key: 'topic', label: 'topic' },
        { key: 'title', label: 'Titolo' },
        { key: 'description', label: 'Descrizione' },
        { key: 'sections', label: 'N Sezioni' },
    ];


    return (
        <>
            <h1>Blog</h1>
            <Grid
                setPrimaryKey={(record: RecordProps) => {
                    console.log(record)
                    return record.title
                }}
                columns={columns}
            >
                <BlogPost data={{ lang: 'Italiano', voice: 'Informative', style: 'Descriptive', limit: '3' }} />
            </Grid>
        </>
    )
}

export default Blog;