import asyncio
import aiohttp
import uuid

# Configuration
US_BASE = 'http://34.170.46.156:8080'
EU_BASE = 'http://34.76.194.253:8080'

# Endpoints
US_REGISTER = f"{US_BASE}/register"
EU_LIST = f"{EU_BASE}/list"
US_CLEAR = f"{US_BASE}/clear"
EU_CLEAR = f"{EU_BASE}/clear"

CONCURRENT_REQUESTS = 50

async def single_test(session, run_id):
    username = f"user_{uuid.uuid4().hex[:8]}"

    try:
        async with session.post(US_REGISTER, json={"username": username}) as resp:
            if resp.status != 200: return "error"
    except:
        return "error"

    try:
        async with session.get(EU_LIST) as resp:
            if resp.status != 200: return "error"
            text = await resp.text()
            
            if username in text:
                return "consistent"
            else:
                return "inconsistent"  
    except:
        return "error"

async def main():
    print(f"Starting Benchmark with {CONCURRENT_REQUESTS} requests...")
    
    async with aiohttp.ClientSession() as session:

        print("Clearing databases...")
        try:
            await session.post(US_CLEAR)
            await session.post(EU_CLEAR)
            print("Databases cleared.")
        except Exception as e:
            print(f"Warning: Could not clear databases. {e}")

        # IMPORTANT: Give the 'delete' command time to replicate!
        # If we don't wait, the delete might not have reached Europe 
        # before our first check arrives.
        print("Waiting 2 seconds for delete to propagate...")
        await asyncio.sleep(2) 

        # --- STEP 2: STRESS TEST ---
        print("Firing requests...")
        tasks = [single_test(session, i) for i in range(CONCURRENT_REQUESTS)]
        results = await asyncio.gather(*tasks)

    # --- STEP 3: REPORT ---
    inconsistent_count = results.count("inconsistent")
    consistent_count = results.count("consistent")
    error_count = results.count("error")
    
    print("\n--- Results ---")
    print(f"Consistent (No Lag):   {consistent_count}")
    print(f"Inconsistent (Lag):    {inconsistent_count}")
    print(f"Errors:                {error_count}")
    
    if (consistent_count + inconsistent_count) > 0:
        lag_rate = (inconsistent_count / (consistent_count + inconsistent_count)) * 100
        print(f"Replication Lag Rate:  {lag_rate:.1f}%")

if __name__ == "__main__":
    asyncio.run(main())