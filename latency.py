import aiohttp
import asyncio
import time
from collections import defaultdict
from statistics import mean

def measure_latency(func):
    async def wrapper(*args, **kwargs):
        start_time = time.perf_counter()
        response = await func(*args, ** kwargs)
        end_time = time.perf_counter()

        return end_time - start_time
    return wrapper

@measure_latency
async def fetch(session, url):
    async with session.get(url) as response:
        await response.read()
        return response


async def main():
    us_base = 'http://136.119.136.176:8080'
    eu_base = 'http://35.195.22.245:8080'

    async with aiohttp.ClientSession() as session:
        print("Starting Requests")
        
        us_reg_tasks = [fetch(session, f"{us_base}/register") for _ in range(10)]
        eu_reg_tasks = [fetch(session, f"{eu_base}/register") for _ in range(10)]
        
        us_list_tasks = [fetch(session, f"{us_base}/list") for _ in range(10)]
        eu_list_tasks = [fetch(session, f"{eu_base}/list") for _ in range(10)]
        
        us_reg_times = await asyncio.gather(*us_reg_tasks)
        eu_reg_times = await asyncio.gather(*eu_reg_tasks)
        us_list_times = await asyncio.gather(*us_list_tasks)
        eu_list_times = await asyncio.gather(*eu_list_tasks)

        print("\n--- Results (Seconds) ---")
        print(f"US /register Avg:     {mean(us_reg_times):.4f}s")
        print(f"EU /register Avg:     {mean(eu_reg_times):.4f}s")
        print(f"US /list Avg:         {mean(us_list_times):.4f}s")
        print(f"EU /list Avg:         {mean(eu_list_times):.4f}s")

if __name__ == "__main__":
    asyncio.run(main())