@props(['url'])
<tr>
<td style="background-color: #0f1729; padding: 40px 40px 0;">
    {{-- Logo row --}}
    <a href="{{ $url }}" style="display: inline-flex; align-items: center; text-decoration: none;">
        <span style="
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 22px;
            font-weight: 700;
            color: #ffffff;
            letter-spacing: -0.4px;
        ">WorkSync</span>
    </a>
    {{-- Gold accent divider --}}
    <div style="margin-top: 32px; height: 1px; background: linear-gradient(90deg, #CBA24A 0%, #1e2d47 60%);"></div>
</td>
</tr>
