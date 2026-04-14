import json

def parse_words():
    with open('extracted_text.txt', 'r', encoding='utf-8') as f:
        lines = [l.strip() for l in f.readlines() if l.strip()]
        
    words = []
    i = 0
    while i < len(lines):
        line = lines[i]
        # skip headers
        if "No." in line or "단어" in line or "뜻" in line or "~" in line:
            i += 1
            continue
            
        # Check if the line is purely a number
        if line.isdigit():
            num = int(line)
            if i + 2 < len(lines):
                word_eng = lines[i+1]
                word_kor = lines[i+2]
                
                # Check if word_kor looks like a meaning (Korean characters or parentheses)
                # Just append
                words.append({
                    "id": num,
                    "word": word_eng,
                    "meaning": word_kor
                })
                i += 3
            else:
                break
        else:
            i += 1
            
    # Remove duplicates based on ID if any and sort
    seen = {}
    for w in words:
        if w['id'] not in seen:
            seen[w['id']] = w
            
    unique_words = list(seen.values())
    unique_words.sort(key=lambda x: x['id'])
    
    with open('words.json', 'w', encoding='utf-8') as f:
        json.dump(unique_words, f, ensure_ascii=False, indent=2)
        
    print(f"Extracted {len(unique_words)} words.")

if __name__ == "__main__":
    parse_words()
