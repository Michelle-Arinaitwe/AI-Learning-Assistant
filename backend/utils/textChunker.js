/**
 * Split text into chunks for better AI processing
 * @param {string} text - The  fullinput text to be chunked
 * @param {number} chunkSize - target size per chunk(in words)
 * @param {number} overlap - number of words to overlap between chunks
 * @returns {Array<{content: string, chunkIndex: number, pageNumber: number}>} - An array of chunk objects with content and index
 */
export const chunkText = (text, chunkSize = 500, overlap = 50) => {
    if (!text || text.trim().length === 0) {
        return [];
    }

    //clean text while preserving paragraph structure
    const cleanedText = text
        .replace(/\r\n/g, '\n') //normalize newlines
        .replace(/\s+/g, ' ') //collapse multiple spaces into one
        .replace(/\n /g, '\n')
        .replace(/ \n/g, '\n')
        .trim();

        //try to split by paragraph (single or double newlines)
    const paragraphs = cleanedText.split(/\n+/).filter(p => p.trim().length > 0);

    const chunks = [];
    let currentChunk = [];
    let currentWordCount = 0;
    let chunkIndex = 0;

    for (const paragraph of paragraphs) {
        const paragraphWords = paragraph.trim().split(/\s+/);
        const paragraphWordCount = paragraphWords.length;

        //if single paragraph exceeds chunk size, we need to split it further by words
        if (currentWordCount > chunkSize) {
            if (currentChunk.length > 0) {
            chunks.push({
                content: currentChunk.join('\n\n'),
                chunkIndex: chunkIndex++,
                pageNumber: 0 
            });
            currentChunk = [];
            currentWordCount = 0;
        }

        //split large paragraph into word-based chunks
        for (let i = 0; i < paragraphWords.length; i += chunkSize - overlap) {
            const chunkWords = paragraphWords.slice(i, i + chunkSize);
            chunks.push({
                content: chunkWords.join(' '),
                chunkIndex: chunkIndex++,
                pageNumber: 0
            });

            if(i + chunkSize >= paragraphWords.length) break;
        }
        continue;
        }

        //if adding this paragraph exceeds chunk size, save current chunk and start new one
        if (currentWordCount + paragraphWordCount > chunkSize && currentChunk.length > 0) {
            chunks.push({
                content: currentChunk.join('\n\n'),
                chunkIndex: chunkIndex++,
                pageNumber: 0
            });

            //create overlap from previous chunk
            const prevChunkText = currentChunk.join(' ');
            const prevWords = prevChunkText.split(/\s+/);
            const overlapText = prevWords.slice(-Math.min(overlap, prevWords.length)).join(' ');

            currentChunk = [overlapText, paragraph.trim()];
            currentWordCount = overlapText.split(/\s+/).length + paragraphWordCount;
        } else {
            //Add paragraph to current chunk
            currentChunk.push(paragraph.trim());
            currentWordCount += paragraphWordCount;
        }
    }

    //Add last chunk
    if (currentChunk.length > 0) {
        chunks.push({
            content: currentChunk.join('\n\n'),
            chunkIndex: chunkIndex,
            pageNumber: 0
        });
    }

    //fallback: if no chunks created, split by words
    if (chunks.length === 0 && cleanedText.length > 0) {
        const allWords = cleanedText.split(/\s+/);
        for (let i = 0; i < allWords.length; i += chunkSize - overlap) {
            const chunkWords = allWords.slice(i, i + chunkSize);
            chunks.push({
                content: chunkWords.join(' '),
                chunkIndex: chunkIndex++,
                pageNumber: 0
            });

            if (i + chunkSize >= allWords.length) break;
        }
    }

    return chunks;
};

/**
 * Find relevant chunks based on keyword matching
 * @param {Array<Object>} chunks - Array of chunk 
 * @param {string} query - The user query to match against chunk content
 * @param {number} maxChunks - Maximum number of relevant chunks to return
 * @returns {Array<Object>} - An array of relevant chunk objects sorted by relevance
 */
export const findRelevantChunks = (chunks, query, maxChunks = 3) => {
    if (!chunks || chunks.length === 0 || !query) {
        return [];
    }

    //common stop words to exclude
    const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but', 'in', 'with', 'to', 'for', 'as', 'by', 'this', 'that', 'it']);

    //extract and clean query words
    const queryWords = query
        .toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 2 && !stopWords.has(word)); //filter out short and stop words

        if (queryWords.length === 0) {
            // return clean chunk objects without mongoose metadata
            return chunks.slice(0, maxChunks).map(chunk => ({
                content: chunk.content,
                chunkIndex: chunk.chunkIndex,
                pageNumber: chunk.pageNumber,
                _id: chunk._id
            }));
        }

        const scoredChunks = chunks.map((chunk, index) => {
            const content = chunk.content.toLowerCase();
            let score = 0;

            //score for each query word
            for (const word of queryWords) {
                //extract word match (higher score)
                const exactMatches = (content.match(new RegExp(`\\b${word}\\b`, 'g')) || []).length;
                score += exactMatches * 3; //exact matches weighted more

                //partial matches (lower score)
                const partialMatches = (content.match(new RegExp(word, 'g')) || []).length;
                score += Math.max(0, partialMatches - exactMatches) * 1.5; //partial matches only count if not already counted as exact
            }

            //bonus: multiply query of words found
            const uniqueWordsFound = queryWords.filter(word => content.includes(word)).length;
            if (uniqueWordsFound > 1) {
                score += uniqueWordsFound * 2; //bonus for multiple query words found
            }

            //normalise by content length
            const contentWords = content.split(/\s+/).length;
            const nomalizedScore = score / Math.sqrt(contentWords); 

            //small bonus for earlier chunks
            const positionBonus = 1 - (index / chunks.length) * 0.1; //earlier chunks get higher bonus

            //return clean object without mongoose meta data
            return {
                content: chunk.content,
                chunkIndex: chunk.chunkIndex,
                pageNumber: chunk.pageNumber,
                _id: chunk._id,
                score: nomalizedScore * positionBonus,
                rawScore: score,
                matchedWords: uniqueWordsFound
             };
        });

        return scoredChunks
        .filter(chunk => chunk.score > 0) //only keep chunks with positive score
        .sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score;
            }
            if (b.matchedWords !== a.matchedWords) {
                return b.matchedWords - a.matchedWords;
            }
            return a.chunkIndex - b.chunkIndex; //tie breaker: earlier chunks first
        })
        .slice(0, maxChunks); //return top relevant chunks
    };
 



  
    